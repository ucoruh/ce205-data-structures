#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Markdown Dokuman Donusturucu

Bu script, docs klasoru altindaki belirlenen klasorlerdeki markdown dosyalarini asagidaki formatlara donusturur:
- HTML slayt (marp)
- PDF slayt (marp) 
- PPTX slayt (marp)
- PDF dokuman (pandoc)
- DOCX (pandoc)
- PPTX (pandoc)

Donusumler multithread olarak paralel yapilir ve sistem kaynaklarini asiri kullanmamak icin
is parcacigi sayisi sinirlandirilmistir.
"""

import os
import sys
import glob
import subprocess
import threading
import queue
import time
import argparse
import signal
from concurrent.futures import ThreadPoolExecutor, as_completed
import platform
import psutil
from tqdm import tqdm

# Script'in bulunduğu dizin
WORKING_DIR = os.path.dirname(os.path.abspath(__file__))
# Docs dizini
DOCS_DIR = os.path.join(WORKING_DIR, "docs")

# Global degiskenler
CONVERSION_QUEUE = queue.Queue()
COMPLETED_COUNT = 0
FAILED_COUNT = 0
TOTAL_FILES = 0
PROGRESS_LOCK = threading.Lock()

# Kullanici tarafindan iptal edilme bayraklari
CANCELLATION_EVENT = threading.Event()
SCRIPT_IS_RUNNING = True
ERROR_DETECTED = threading.Event()  # Hata durumunda tüm işlemleri durdurmak için

# Bu değişken tüm markdown dosyalarını tutacak
ALL_MARKDOWN_FILES = []

# Alt süreçleri izlemek için liste
ACTIVE_PROCESSES = []
PROCESS_LOCK = threading.Lock()

# Subprocess Timeout (saniye)
SUBPROCESS_TIMEOUT = 60  # 60 saniye timeout

# Islenecek klasorlerin sabit listesi (Course modules)
TARGET_FOLDERS = [
    "syllabus",
    "week-1",
    "week-2",
    "week-3",
    "week-4",
    "week-5",
    "week-6",
    "week-7", 
    "week-8",
    "week-9",
    "week-10",
    "week-11",
    "week-12",
    "week-13",
    "week-14",
    "week-15",
    "week-16"
]

# Renk kodlari
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_color(text, color):
    """Renkli cikti yazdirma fonksiyonu"""
    if sys.platform == 'win32':  # Windows'ta ANSI renk kodlarini etkinlestir
        os.system('color')
    print(f"{color}{text}{Colors.ENDC}")

def find_markdown_files(root_dir, pattern="**/*.md"):
    """
    Sadece belirlenen TARGET_FOLDERS icerisindeki markdown dosyalarini bulur
    """
    all_files = []
    root_dir = os.path.abspath(root_dir)  # Mutlak yol kullan
    
    # Eğer root_dir doğrudan proje ana dizini ise, docs klasörünü kullan
    docs_dir = os.path.join(root_dir, "docs")
    if os.path.exists(docs_dir) and os.path.isdir(docs_dir):
        root_dir = docs_dir
    
    print_color(f"Dokuman dizini: {root_dir}", Colors.CYAN)
    
    # Her hedef klasor icin dosyalari bul
    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(root_dir, folder)
        folder_path = os.path.abspath(folder_path)  # Mutlak yol kullan
        
        if not os.path.exists(folder_path):
            print_color(f"[UYARI] Klasor bulunamadi: {folder_path}", Colors.WARNING)
            continue
            
        print_color(f"[INFO] Dosyalar araniyor: {folder_path}", Colors.BLUE)
        
        # Tum .md, .en.md ve .tr.md dosyalarini bul
        for extension in ["*.md", "*.en.md", "*.tr.md"]:
            # Glob pattern oluşturulurken Windows/Unix uyumluluğu için normalize et
            if sys.platform == 'win32':
                search_pattern = os.path.join(folder_path, "**", extension)
            else:
                search_pattern = os.path.join(folder_path, "**", extension)
                
            try:
                # Bulunan her dosya için kontrol yap
                found_files = glob.glob(search_pattern, recursive=True)
                for file_path in found_files:
                    # Dosya gerçekten var mı kontrol et
                    if os.path.exists(file_path) and os.path.isfile(file_path):
                        # Dosya boş değil mi kontrol et
                        if os.path.getsize(file_path) > 0:
                            all_files.append(file_path)
                        else:
                            print_color(f"[UYARI] Bos dosya atlandi: {file_path}", Colors.WARNING)
                    else:
                        print_color(f"[UYARI] Dosya bulunamadi: {file_path}", Colors.WARNING)
            except Exception as e:
                print_color(f"[HATA] Dosya aranirken hata: {str(e)}", Colors.FAIL)
    
    # "site" dizinindeki dosyalari haric tut
    filtered_files = [f for f in all_files if "/site/" not in f.replace("\\", "/")]
    
    # Dosya yollarini normalize et - Windows/Unix farkliliklarini ele al
    normalized_files = []
    for file_path in filtered_files:
        abs_path = os.path.abspath(file_path)
        normalized_files.append(abs_path)
        
    print_color(f"[INFO] Toplam {len(normalized_files)} markdown dosyasi bulundu.", Colors.BLUE)
    
    # Dosya listesini sırala (daha tutarlı çıktı için)
    normalized_files.sort()
    
    return normalized_files

def convert_file(markdown_file):
    """
    Bir markdown dosyasini marp ve pandoc ile farkli formatlara donusturur
    MUTLAK DOSYA YOLLARI kullanir ve çalışma dizinini değiştirmez.
    """
    global FAILED_COUNT, COMPLETED_COUNT, ACTIVE_PROCESSES, ERROR_DETECTED
    
    # Iptal edilme kontrolu
    if CANCELLATION_EVENT.is_set() or ERROR_DETECTED.is_set():
        return False
        
    try:
        success = True
        # Mutlak dosya yollarını ve dizinleri al
        abs_markdown_file = os.path.abspath(markdown_file)
        file_dir = os.path.dirname(abs_markdown_file)
        file_name = os.path.basename(abs_markdown_file)
        file_base = os.path.splitext(file_name)[0]
        
        # Dosyanin varligini kontrol et
        if not os.path.exists(abs_markdown_file):
            print_color(f"[HATA] Dosya bulunamadi: {abs_markdown_file}", Colors.FAIL)
            with PROGRESS_LOCK:
                FAILED_COUNT += 1
            
            # Kritik olmayan hata olarak işaretle
            return False
            
        print_color(f"[INFO] Donusturuluyor: {file_name}", Colors.BLUE)
        
        # Mutlak çıktı dosya yollarını oluştur
        output_html = os.path.join(file_dir, f"{file_base}_slide.html")
        output_pdf = os.path.join(file_dir, f"{file_base}_slide.pdf")
        output_pptx_slide = os.path.join(file_dir, f"{file_base}_slide.pptx")
        output_pdf_doc = os.path.join(file_dir, f"{file_base}_doc.pdf")
        output_docx = os.path.join(file_dir, f"{file_base}_word.docx")
        output_pptx = os.path.join(file_dir, f"{file_base}_word.pptx")
        
        # Chrome için ek parametreler (Puppeteer için)
        chrome_flags = [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--disable-features=HttpsFirstBalancedModeAutoEnable"
        ]
        
        # GitHub issue'dan gelen ek flag
        # Kurumsal politikalarla ilgili sorunları çözmek için
        # Chrome uzantılarını devre dışı bırakmayı engelle
        chrome_flags.append("--ignore-gpu-blocklist")
        
        # Şirket politikaları için uzantıları etkinleştirme
        if not "CHROME_ENABLE_EXTENSIONS" in os.environ:
            # Otomatik olarak ortam değişkenini ayarla
            os.environ["CHROME_ENABLE_EXTENSIONS"] = "1"
            chrome_flags.append("--disable-extensions=false")
        
        chrome_flags_str = " ".join(chrome_flags)
        
        # Dosyanın olduğu dizine değişmek için eski çalışma dizinini kaydet
        old_cwd = os.getcwd()
        
        # Dosyanın olduğu dizine geç - bu önemli, çünkü göreceli resimleri bulabilmek için gereken bir adım
        try:
            # Geçici dosyaları temizle - işlem başlamadan önce
            clean_file_dir_temp_files(file_dir)
            
            # Dosyanın bulunduğu dizine geç 
            os.chdir(file_dir)
            
            # Göreceli dosya yolunu hesapla (dosya adı)
            rel_markdown_file = os.path.basename(abs_markdown_file)
            
            # Dosya erişimi tekrar kontrol et
            if not os.path.exists(rel_markdown_file):
                print_color(f"[HATA] Dosya bulunamadi (göreceli yol): {rel_markdown_file}", Colors.FAIL)
                os.chdir(old_cwd)  # Eski çalışma dizinine dön
                return False
                
            try:
                # Komutlari olustur - batch dosyasındaki gibi daha basit parametrelerle
                commands = [
                    # Marp ile HTML slayt
                    ["marp", rel_markdown_file, "--html", "-o", f"{file_base}_slide.html", "--allow-local-files"],
                    
                    # Marp ile PPTX slayt
                    ["marp", rel_markdown_file, "--pptx", "-o", f"{file_base}_slide.pptx", "--allow-local-files"],
                    
                    # Pandoc ile DOCX
                    ["pandoc", "-o", f"{file_base}_word.docx", "-f", "markdown", "-t", "docx", rel_markdown_file],
                    
                    # Pandoc ile PPTX
                    ["pandoc", "-o", f"{file_base}_word.pptx", "-f", "markdown", "-t", "pptx", rel_markdown_file],
                ]
                
                # PDF dönüşümü devre dışı bırakılmadıysa, Pandoc PDF komutunu ekle
                if not args.disable_pdf:
                    # Pandoc ile PDF dokuman
                    commands.append(["pandoc", rel_markdown_file, "--pdf-engine=xelatex", "-f", "markdown-implicit_figures", 
                                    "-V", "colorlinks", "-V", "urlcolor=NavyBlue", "-V", "toccolor=Red", 
                                    "--toc", "-N", "-o", f"{file_base}_doc.pdf"])
                
                # Dönüşüm sonuçlarını takip et
                results = []
                command_success = True
                
                # PDF dönüşümü devre dışı bırakılmadıysa, Marp ile PDF dönüşümünü dene
                if not args.disable_pdf:
                    # Marp PDF dönüşüm komutu
                    try:
                        # Marp ile PDF çıktısı Chrome'da sorun yaratabilir, kontrollü şekilde dene
                        print_color(f"  PDF slayt dönüştürme deneniyor...", Colors.CYAN)
                        
                        # Doğrudan Puppeteer argümanlarını kullanarak dene (sorunları önlemek için)
                        pdf_cmd = ["marp", rel_markdown_file, "--html", "--pdf", "-o", f"{file_base}_slide.pdf", 
                                "--allow-local-files", "--puppeteer-args", chrome_flags_str]
                        
                        if args.verbose:
                            print_color(f"    Komut: {' '.join(pdf_cmd)}", Colors.CYAN)
                        
                        process = subprocess.Popen(
                            pdf_cmd, 
                            stdout=subprocess.PIPE, 
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        
                        with PROCESS_LOCK:
                            ACTIVE_PROCESSES.append(process)
                        
                        try:
                            stdout, stderr = process.communicate(timeout=SUBPROCESS_TIMEOUT)
                            exit_code = process.returncode
                            
                            if exit_code != 0:
                                print_color(f"  [UYARI] PDF oluşturmada sorun oluştu, alternatif yöntemle yeniden deneniyor...", Colors.WARNING)
                                print_color(f"  [BILGI] Hata mesajı: {stderr.strip()}", Colors.CYAN)
                                
                                # Alternatif komut deneyin (bazen --unsafe-html daha iyi çalışır)
                                pdf_cmd = ["marp", rel_markdown_file, "--html", "--pdf", "-o", f"{file_base}_slide.pdf", 
                                        "--allow-local-files", "--unsafe-html", "--puppeteer-args", chrome_flags_str]
                                
                                if args.verbose:
                                    print_color(f"    Komut: {' '.join(pdf_cmd)}", Colors.CYAN)
                                
                                process = subprocess.Popen(
                                    pdf_cmd, 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE,
                                    text=True,
                                    env=dict(os.environ, CHROME_ENABLE_EXTENSIONS="1")  # Ortam değişkenini garantiye al
                                )
                                
                                with PROCESS_LOCK:
                                    ACTIVE_PROCESSES.append(process)
                                
                                stdout, stderr = process.communicate(timeout=SUBPROCESS_TIMEOUT)
                                exit_code = process.returncode
                            
                            if exit_code != 0:
                                print_color(f"  [HATA] PDF slayt oluşturulamadı: {stderr}", Colors.FAIL)
                                command_success = False
                            else:
                                print_color(f"  [BASARILI] PDF slayt oluşturuldu", Colors.GREEN)
                                
                        except subprocess.TimeoutExpired:
                            print_color(f"  [UYARI] PDF oluşturma zaman aşımına uğradı!", Colors.WARNING)
                            process.kill()
                            command_success = False
                    except Exception as e:
                        print_color(f"  [HATA] PDF slayt oluşturulurken istisna: {str(e)}", Colors.FAIL)
                        command_success = False
                
                # Diğer komutları çalıştır
                for cmd in commands:
                    if CANCELLATION_EVENT.is_set() or ERROR_DETECTED.is_set():
                        break
                    
                    command_str = " ".join(cmd)
                    output_type = ""
                    
                    # Komut türünü belirle
                    if "--html" in command_str:
                        output_type = "HTML slayt"
                    elif "--pptx" in command_str:
                        output_type = "PPTX slayt"
                    elif "-t docx" in command_str:
                        output_type = "DOCX dokuman"
                    elif "-t pptx" in command_str:
                        output_type = "PPTX dokuman"
                    elif "--pdf-engine" in command_str:
                        output_type = "PDF dokuman"
                    
                    try:
                        print_color(f"  {output_type} dönüştürme deneniyor...", Colors.CYAN)
                        
                        if args.verbose:
                            print_color(f"    Komut: {command_str}", Colors.CYAN)
                        
                        process = subprocess.Popen(
                            cmd,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        
                        with PROCESS_LOCK:
                            ACTIVE_PROCESSES.append(process)
                        
                        stdout, stderr = process.communicate(timeout=SUBPROCESS_TIMEOUT)
                        exit_code = process.returncode
                        
                        if exit_code != 0:
                            print_color(f"  [HATA] {output_type} olusturulamadi: {stderr}", Colors.FAIL)
                            results.append(False)
                            command_success = False
                        else:
                            print_color(f"  [BASARILI] {output_type} olusturuldu", Colors.GREEN)
                            results.append(True)
                    except subprocess.TimeoutExpired:
                        print_color(f"  [UYARI] {output_type} olusturma zaman asimina ugradi!", Colors.WARNING)
                        process.kill()
                        with PROCESS_LOCK:
                            try:
                                ACTIVE_PROCESSES.remove(process)
                            except ValueError:
                                pass
                        results.append(False)
                        command_success = False
                    except Exception as e:
                        print_color(f"  [HATA] {output_type} oluşturulurken istisna: {str(e)}", Colors.FAIL)
                        results.append(False)
                        command_success = False
                
                # İşlem sonuçlarını değerlendir
                success_count = sum(1 for r in results if r)
                
                # Dönüştürme özeti
                if args.verbose:
                    print_color(f"  [OZET] Toplam {len(results)} komut islendi, {success_count} basarili, {len(results) - success_count} basarisiz", Colors.CYAN)
                
                # Toplam başarı/başarısızlık durumunu belirle
                if not command_success:
                    success = False
                
                total_count = len(results)
                
                # Tüm işlemler başarısızsa
                if success_count == 0:
                    success = False
                    print_color(f"[BASARISIZ] {file_name} - Hicbir donusum basarili olmadi", Colors.FAIL)
                # Bazı işlemler başarılı, bazıları başarısızsa
                elif success_count < total_count:
                    success = True  # Kısmi başarıyı başarı olarak kabul et
                    print_color(f"[KISMEN BASARILI] {file_name} - Bazi donusumler tamamlandi, bazilari basarisiz", Colors.WARNING)
                # Tüm işlemler başarılıysa
                else:
                    success = True
                    print_color(f"[BASARILI] {file_name} - Tum donusumler tamamlandi", Colors.GREEN)
            finally:
                # İşlem sonrasında dosya dizinindeki geçici dosyaları temizle
                clean_file_dir_temp_files(file_dir)
                
                # Çalışma dizinini geri al
                os.chdir(old_cwd)
        except Exception as e:
            print_color(f"[HATA] Çalışma dizini değiştirilemedi: {str(e)}", Colors.FAIL)
            success = False
            os.chdir(old_cwd)  # Her ihtimale karşı çalışma dizinini geri almaya çalış
        
    except Exception as e:
        print_color(f"[HATA] {markdown_file} dönüştürülürken beklenmeyen hata: {str(e)}", Colors.FAIL)
        # Stack trace bilgilerini göster
        if args.verbose:
            import traceback
            print_color(traceback.format_exc(), Colors.FAIL)
        success = False
    
    # İşlem sonucunu geri bildir
    return success

def clean_file_dir_temp_files(directory):
    """
    Belirtilen dizindeki tex2pdf.* gibi geçici dosyaları temizler.
    Bu fonksiyon convert_file işlemi sırasında kullanılır.
    
    Args:
        directory: Temizlenecek dizin
    """
    if not os.path.exists(directory) or not os.path.isdir(directory):
        return 0
    
    cleaned_items = 0
    
    try:
        # tex2pdf.* klasörlerini temizle
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            
            # tex2pdf. ile başlayan klasörleri temizle
            if os.path.isdir(item_path) and item.startswith("tex2pdf."):
                try:
                    import shutil
                    shutil.rmtree(item_path, ignore_errors=True)
                    cleaned_items += 1
                    if args.verbose:
                        print_color(f"    [TEMIZLIK] Gecici klasor silindi: {item_path}", Colors.CYAN)
                except Exception as e:
                    if args.verbose:
                        print_color(f"    [UYARI] Gecici klasor silinemedi: {item_path} - {str(e)}", Colors.WARNING)
            
            # .tmp, .aux, .log gibi geçici dosyaları temizle
            elif os.path.isfile(item_path) and (
                item.endswith(".tmp") or 
                item.endswith(".aux") or 
                item.endswith(".log") or 
                item.endswith(".toc") or
                item.endswith(".out") or
                item.endswith(".bbl") or
                item.endswith(".bcf") or
                item.endswith(".blg") or
                item.endswith(".synctex.gz") or
                item.startswith("marp-") and item.endswith(".html")
            ):
                try:
                    os.remove(item_path)
                    cleaned_items += 1
                    if args.verbose:
                        print_color(f"    [TEMIZLIK] Gecici dosya silindi: {item_path}", Colors.CYAN)
                except Exception as e:
                    if args.verbose:
                        print_color(f"    [UYARI] Gecici dosya silinemedi: {item_path} - {str(e)}", Colors.WARNING)
    except Exception as e:
        if args.verbose:
            print_color(f"    [UYARI] Dizin temizlenirken hata: {directory} - {str(e)}", Colors.WARNING)
    
    return cleaned_items

def clean_output_files(root_dir):
    """
    Belirlenen klasorlerdeki donusturulmus dosyalari temizler
    """
    cleaned_files = 0
    
    # Temizlenecek dosya uzantilari
    output_extensions = [
        "*_slide.html", 
        "*_slide.pdf", 
        "*_slide.pptx", 
        "*_doc.pdf", 
        "*_word.docx", 
        "*_word.pptx"
    ]
    
    print_color("Donusturulmus dosyalar temizleniyor...", Colors.BLUE)
    
    # Her klasor icin temizleme islemi
    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(root_dir, folder)
        
        if not os.path.exists(folder_path):
            continue
            
        # Her uzanti icin dosyalari bul ve sil
        for ext in output_extensions:
            pattern = os.path.join(folder_path, "**", ext)
            files = glob.glob(pattern, recursive=True)
            
            for file in files:
                try:
                    os.remove(file)
                    cleaned_files += 1
                except Exception as e:
                    print_color(f"[HATA] {file} silinirken hata: {str(e)}", Colors.FAIL)
    
    if cleaned_files > 0:
        print_color(f"Toplam {cleaned_files} donusturulmus dosya temizlendi.", Colors.GREEN)
    else:
        print_color("Temizlenecek dosya bulunamadi.", Colors.CYAN)
    
    return cleaned_files

def clean_temp_output_files(root_dir):
    """
    Pandoc ve Marp tarafindan olusturulan gecici dosya ve klasorleri temizler
    """
    cleaned_files = 0
    cleaned_dirs = 0
    
    # Temizlenecek gecici dosya ve klasor kaliplari
    temp_patterns = [
        "tex2pdf.-*",        # pandoc LaTeX geçici dosyaları
        "*.tmp",             # geçici dosyalar
        "~$*",               # Office geçici dosyaları
        "*.log",             # log dosyaları
        "*.aux",             # LaTeX yardımcı dosyaları
        "*.toc",             # LaTeX içindekiler dosyaları
        "*.out",             # LaTeX çıktı dosyaları
        "*.bbl",             # LaTeX kaynakça dosyaları
        "*.bcf",             # LaTeX kaynakça dosyaları
        "*.blg",             # LaTeX kaynakça log dosyaları
        "*.synctex.gz",      # LaTeX sync dosyaları
        "marp-*.html"        # Marp geçici HTML dosyaları
    ]
    
    print_color("Pandoc/Marp gecici dosyalari temizleniyor...", Colors.BLUE)
    
    # Ana çalışma dizinindeki tex2pdf klasörlerini temizle
    try:
        # Direkt olarak ana çalışma dizinindeki tex2pdf klasörlerini temizle
        for item in os.listdir(root_dir):
            item_path = os.path.join(root_dir, item)
            if os.path.isdir(item_path) and item.startswith("tex2pdf."):
                try:
                    import shutil
                    shutil.rmtree(item_path, ignore_errors=True)
                    cleaned_dirs += 1
                    if args.verbose:
                        print_color(f"    Gecici klasor silindi: {item_path}", Colors.CYAN)
                except Exception as e:
                    print_color(f"[UYARI] Gecici klasor silinemedi: {item_path} - {str(e)}", Colors.WARNING)
    except Exception as e:
        print_color(f"[UYARI] Ana dizindeki tex2pdf klasörlerini temizlerken hata: {str(e)}", Colors.WARNING)
    
    # docs klasörü varsa onun içinde de ara
    docs_dir = os.path.join(root_dir, "docs")
    if os.path.exists(docs_dir) and os.path.isdir(docs_dir):
        try:
            for item in os.listdir(docs_dir):
                item_path = os.path.join(docs_dir, item)
                if os.path.isdir(item_path) and item.startswith("tex2pdf."):
                    try:
                        import shutil
                        shutil.rmtree(item_path, ignore_errors=True)
                        cleaned_dirs += 1
                        if args.verbose:
                            print_color(f"    Gecici klasor silindi: {item_path}", Colors.CYAN)
                    except Exception as e:
                        print_color(f"[UYARI] Gecici klasor silinemedi: {item_path} - {str(e)}", Colors.WARNING)
        except Exception as e:
            print_color(f"[UYARI] docs dizinindeki tex2pdf klasörlerini temizlerken hata: {str(e)}", Colors.WARNING)
    
    # Her klasor icin temizleme islemi
    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(root_dir, folder)
        
        if not os.path.exists(folder_path):
            continue
            
        # HER BİR MARKDOWN DÖKÜMANININ BULUNDUĞU ALT DİZİNLERİ DE TEMİZLE
        if os.path.isdir(folder_path):
            # Alt dizinlerdeki tex2pdf dosyalarını da temizle
            for subdir, _, _ in os.walk(folder_path):
                # Mevcut alt dizindeki tex2pdf klasörlerini temizle
                temp_files_cleaned = clean_file_dir_temp_files(subdir)
                cleaned_files += temp_files_cleaned  # Temizlenen dosya sayısını ekle
        
        # Her kalıp için dosyaları bul ve sil
        for pattern in temp_patterns:
            # Dosyalar
            try:
                search_pattern = os.path.join(folder_path, "**", pattern)
                files = glob.glob(search_pattern, recursive=True)
                
                for file in files:
                    try:
                        if os.path.isfile(file):
                            os.remove(file)
                            cleaned_files += 1
                            if args.verbose:
                                print_color(f"    Gecici dosya silindi: {file}", Colors.CYAN)
                    except Exception as e:
                        print_color(f"[UYARI] Gecici dosya silinemedi: {file} - {str(e)}", Colors.WARNING)
            except Exception as e:
                print_color(f"[UYARI] Kalip isleme hatasi: {pattern} - {str(e)}", Colors.WARNING)
        
        # tex2pdf geçici klasörlerini bul ve sil
        try:
            for root, dirs, files in os.walk(folder_path):
                for dir_name in dirs:
                    if dir_name.startswith("tex2pdf.") or dir_name == "_marp_tmp_":
                        try:
                            dir_path = os.path.join(root, dir_name)
                            import shutil
                            shutil.rmtree(dir_path, ignore_errors=True)
                            cleaned_dirs += 1
                            if args.verbose:
                                print_color(f"    Gecici klasor silindi: {dir_path}", Colors.CYAN)
                        except Exception as e:
                            print_color(f"[UYARI] Gecici klasor silinemedi: {dir_path} - {str(e)}", Colors.WARNING)
        except Exception as e:
            print_color(f"[UYARI] Klasor tarama hatasi: {folder_path} - {str(e)}", Colors.WARNING)
    
    if cleaned_files > 0 or cleaned_dirs > 0:
        print_color(f"Toplam {cleaned_files} gecici dosya ve {cleaned_dirs} gecici klasor temizlendi.", Colors.GREEN)
    else:
        print_color("Temizlenecek gecici dosya veya klasor bulunamadi.", Colors.CYAN)
    
    return cleaned_files + cleaned_dirs

def worker(index=None):
    """
    İş parçacığının ana işlevi:
    Kuyruktan dosya alır ve dönüştürür
    
    Args:
        index: Dosya indeksi (ThreadPoolExecutor.map tarafindan saglanir)
    """
    # Global degiskenleri kullanacagiz
    global CANCELLATION_EVENT, ERROR_DETECTED, ALL_MARKDOWN_FILES, COMPLETED_COUNT, FAILED_COUNT
    
    # Iptal edilme kontrolu
    if CANCELLATION_EVENT.is_set() or ERROR_DETECTED.is_set():
        return False
    
    # ThreadPoolExecutor.map ile çağrıldıysa, doğrudan dosyayı işle
    if index is not None and index < len(ALL_MARKDOWN_FILES):
        try:
            md_file = ALL_MARKDOWN_FILES[index]
            if os.path.exists(md_file) and os.path.isfile(md_file):
                result = convert_file(md_file)
                
                # İşlem sonucunu güncelle
                with PROGRESS_LOCK:
                    if result:
                        COMPLETED_COUNT += 1
                    else:
                        FAILED_COUNT += 1
                        # Bir dosya bile başarısız olursa ve kritik hata varsa diğer işlemleri durdur
                        if args and hasattr(args, 'stop_on_error') and args.stop_on_error:
                            ERROR_DETECTED.set()  # Tüm işlemleri durdur
                            print_color(f"[KRITIK HATA] Bir dosya dönüştürülemedi, tüm işlemler durduruluyor...", Colors.FAIL)
                            kill_all_processes()
                
                return result
            else:
                print_color(f"[HATA] Dosya bulunamadi: {md_file}", Colors.FAIL)
                with PROGRESS_LOCK:
                    FAILED_COUNT += 1
                    
                    # Bir dosya bile başarısız olursa ve kritik hata varsa diğer işlemleri durdur
                    if args and hasattr(args, 'stop_on_error') and args.stop_on_error:
                        ERROR_DETECTED.set()  # Tüm işlemleri durdur
                        print_color(f"[KRITIK HATA] Bir dosya bulunamadı, tüm işlemler durduruluyor...", Colors.FAIL)
                        kill_all_processes()
                
                return False
        except Exception as e:
            print_color(f"[HATA] Dosya işlenirken beklenmeyen hata: {str(e)}", Colors.FAIL)
            with PROGRESS_LOCK:
                FAILED_COUNT += 1
                
                # Beklenmeyen bir hata olduğunda da diğer işlemleri durdur
                ERROR_DETECTED.set()  # Hata durumunda tüm işlemleri durdur
                print_color(f"[KRITIK HATA] Beklenmeyen bir hata oluştu, tüm işlemler durduruluyor...", Colors.FAIL)
                kill_all_processes()
                
            return False
    
    # Klasik iş parçacığı modunda çalışıyorsa (queue ile)
    # İş parçacığı başlangıcında bu mesajı göster
    print_color("[BILGI] Is parcacigi baslatildi", Colors.CYAN)
    
    try:
        while not CANCELLATION_EVENT.is_set() and not ERROR_DETECTED.is_set():
            try:
                # Kuyruktan bir dosya al (maksimum 1 saniye bekle)
                md_file = CONVERSION_QUEUE.get(block=True, timeout=1.0)
                
                # Dosyayı dönüştür
                result = convert_file(md_file)
                
                # Dönüşüm başarısız olduğunda tüm işlemleri durdur
                if not result and args and hasattr(args, 'stop_on_error') and args.stop_on_error:
                    ERROR_DETECTED.set()
                    print_color(f"[KRITIK HATA] Bir dosya dönüştürülemedi, tüm işlemler durduruluyor...", Colors.FAIL)
                    kill_all_processes()
                
                # İşin tamamlandığını işaretle
                CONVERSION_QUEUE.task_done()
                
            except queue.Empty:
                # Kuyruk boşsa (timeout), döngüyü sonlandır
                break
            except Exception as e:
                print_color(f"[HATA] Dosya donusturulurken beklenmeyen hata: {str(e)}", Colors.FAIL)
                # Kuyruk task'ını tamamlandı olarak işaretle (deadlock önleme)
                try:
                    CONVERSION_QUEUE.task_done()
                except:
                    pass
                
                # Beklenmeyen bir hata olduğunda da tüm işlemleri durdur
                ERROR_DETECTED.set()
                print_color(f"[KRITIK HATA] Beklenmeyen bir hata oluştu, tüm işlemler durduruluyor...", Colors.FAIL)
                kill_all_processes()
        
    except Exception as e:
        print_color(f"[HATA] Is parcacigi calisirken beklenmeyen hata: {str(e)}", Colors.FAIL)
        # Hata bayrağını set et
        ERROR_DETECTED.set()
        kill_all_processes()
    finally:
        # Isin bittigini isaretle, olasi deadlock'lari onle
        try:
            CONVERSION_QUEUE.task_done()
        except ValueError:  # Queue can raise ValueError if empty
            pass
    
    # İptal edildiyse, temiz bir şekilde çık
    print_color("[BILGI] Is parcacigi sonlandiriliyor", Colors.CYAN)
    return False

def get_optimal_thread_count():
    """
    Sistem icin optimal is parcacigi sayisini hesaplar
    """
    # CPU cekirdek sayisinin %75'ini kullan, en az 2, en fazla 8 is parcacigi
    cpu_count = psutil.cpu_count(logical=True)
    optimal = max(2, min(int(cpu_count * 0.75), 8))
    return optimal

def handle_sigint(signum, frame):
    """
    CTRL+C ile kesinti sinyalini yakala
    """
    global CANCELLATION_EVENT, SCRIPT_IS_RUNNING, ERROR_DETECTED
    
    if not CANCELLATION_EVENT.is_set():
        print_color("\n[UYARI] Kesme sinyali alindi. Tüm işlemler aninda sonlandiriliyor...", Colors.WARNING)
        CANCELLATION_EVENT.set()  # Thread'lere iptal sinyali gönder
        ERROR_DETECTED.set()  # Hata durumu ayarla
        SCRIPT_IS_RUNNING = False  # Ana döngüyü sonlandır
        
        # Tüm alt süreçleri öldür
        kill_all_processes()
        
        print_color("[BILGI] Tüm islemler durduruldu. Çikis yapiliyor...", Colors.WARNING)
        sys.exit(1)  # Zorla çıkış yap
    else:
        print_color("\n[UYARI] Zorla sonlandiriliyor!", Colors.FAIL)
        # İkinci CTRL+C basımında anında çık
        os._exit(1)  # Acil çıkış - tüm thread ve süreçler anında sonlandırılır

def kill_all_processes():
    """
    Aktif tüm alt süreçleri sonlandirir
    """
    global ACTIVE_PROCESSES
    
    with PROCESS_LOCK:
        active_count = len(ACTIVE_PROCESSES)
        if active_count > 0:
            print_color(f"[BILGI] {active_count} aktif alt süreç sonlandiriliyor...", Colors.WARNING)
            
            for proc in ACTIVE_PROCESSES[:]:  # Kopyası üzerinde işlem yap
                try:
                    if proc.poll() is None:  # Eğer hala çalışıyorsa
                        proc.kill()  # Süreci öldür
                        print_color(f"[BILGI] Alt süreç sonlandirildi (PID: {proc.pid})", Colors.WARNING)
                except Exception as e:
                    print_color(f"[HATA] Alt süreç sonlandirilirken hata: {str(e)}", Colors.FAIL)
            
            # Listeyi temizle
            ACTIVE_PROCESSES.clear()
            print_color("[BILGI] Tüm aktif alt süreçler sonlandirildi.", Colors.WARNING)
        else:
            print_color("[BILGI] Sonlandirilacak aktif alt süreç yok.", Colors.CYAN)

def update_progress():
    """
    İlerleme durumunu güncelleyen fonksiyon.
    ThreadPoolExecutor ile birlikte kullanilir.
    """
    completed_prev = 0
    failed_prev = 0
    total = len(ALL_MARKDOWN_FILES)
    
    # Başlangıç ilerleme çubuğu
    with tqdm(total=total, desc="Dönüştürülüyor", unit="dosya") as progress_bar:
        while not CANCELLATION_EVENT.is_set():
            # İlerlemeyi güncelle
            with PROGRESS_LOCK:
                completed = COMPLETED_COUNT
                failed = FAILED_COUNT

            # Tamamlanan yeni işleri göster
            if completed + failed > completed_prev + failed_prev:
                progress_bar.update((completed + failed) - (completed_prev + failed_prev))
                completed_prev = completed
                failed_prev = failed
                
                # Chrome/Puppeteer hatası olup olmadığını kontrol et - hata varsa uyarı mesajı göster
                if ERROR_DETECTED.is_set():
                    print_color("\n[UYARI] Chrome/Puppeteer hatasi tespit edildi!", Colors.WARNING)
                    print_color("- Bu, PDF olusturma sürecinde bir sorun oldugunu gosterir", Colors.WARNING)
                    print_color("- Diğer çikti formatlari (HTML, PPTX) başariyla olusturulabilir", Colors.WARNING)
                    print_color("- Chrome/Chromium yuklu ve erisilebilir oldugundan emin olun", Colors.WARNING)
                    print_color("- https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md", Colors.CYAN)
                    
            # İşlem tamamlandi mi kontrol et
            if completed + failed >= total:
                break
                
            # Biraz bekle
            time.sleep(0.5)

        # Son ilerleme durumunu göster
        remaining = total - progress_bar.n
        if remaining > 0:
            progress_bar.update(remaining)

def show_detailed_help():
    print_color("""
==========================================
  MARKDOWN DOKUMAN DONUSTURME ARACI
==========================================

Bu script, belirlenen klasorlerdeki markdown dosyalarini cesitli formatlara donusturur:
- HTML slayt (marp)
- PDF slayt (marp)
- PPTX slayt (marp)
- PDF dokuman (pandoc)
- DOCX (pandoc)
- PPTX (pandoc)

KULLANIM SEÇENEKLERI:
--------------------
1. Normal Calistirma (Temizle + Donustur):
   python convert_all_markdown.py

2. Sadece Temizleme:
   python convert_all_markdown.py --clean-only

3. Farkli Dizin:
   python convert_all_markdown.py --dir baska_dizin

4. Thread Sayisi Belirtme:
   python convert_all_markdown.py --threads 4

5. Tek Dosya Testi:
   python convert_all_markdown.py --single-file path/to/file.md

6. Detayli Cikti:
   python convert_all_markdown.py --verbose

7. Geçici Dosyaları Temizleme:
   python convert_all_markdown.py --clean-temp

8. Özel Chrome Yolu Belirtme:
   python convert_all_markdown.py --chrome-path "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

9. PDF Dönüşümünü Devre Dışı Bırakma:
   python convert_all_markdown.py --disable-pdf

10. Hata Durumunda İşlemi Durdurma:
    python convert_all_markdown.py --stop-on-error

ISLENECEK KLASORLER:
-------------------
{0}

CHROME/PUPPETEER SORUNLARINI ÇÖZME:
----------------------------------
1. 'Failed to launch the browser process' hatası alıyorsanız:
   - CHROME_ENABLE_EXTENSIONS=1 ortam değişkenini ayarlayın:
     SET CHROME_ENABLE_EXTENSIONS=1 (Windows)
     export CHROME_ENABLE_EXTENSIONS=1 (Linux/Mac)
   
   - Chrome yolunu doğrudan belirtin:
     python convert_all_markdown.py --chrome-path "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
   
   - Chrome cache klasörünü temizleyin:
     rmdir /s /q %USERPROFILE%\\.cache\\puppeteer
   
   - Alternatif olarak, PDF oluşturmayı tamamen devre dışı bırakabilirsiniz:
     python convert_all_markdown.py --disable-pdf

2. Windows'ta Chrome izinleri:
   icacls "%USERPROFILE%/.cache/puppeteer/chrome" /grant *S-1-15-2-1:(OI)(CI)(RX)

3. 'Protocol error (IO.Read)' hatası alıyorsanız:
   - Chrome sürümünüzün 77 veya üstü olduğundan emin olun
   - npm update puppeteer ile Puppeteer'ı güncelleyin
   - Veya PDF oluşturmayı devre dışı bırakın: --disable-pdf

KONTROL:
-------
- İptal etmek için Ctrl+C tuşlarına basın (tüm işlemler anında durdurulur)
- Script çalışıyorken kapatmak zorunda kalırsanız, Task Manager/Görev Yöneticisi'nden Python işlemlerini sonlandırabilirsiniz
- Herhangi bir dosya işlenirken hata olursa tüm işlemleri durdurmak için --stop-on-error kullanın

UYARILAR:
--------
- Pandoc ve Marp kurulu ve çalışır durumda olmalıdır
- İşlem başlamadan önce tüm dosyaların kapalı olduğundan emin olun
- Büyük dosyalarda pandoc işlemi uzun sürebilir
- Marp PDF çıktısı için Chrome/Chromium gereklidir
- PDF oluşturmada sorun yaşıyorsanız --disable-pdf parametresini kullanabilirsiniz
- Güvenilir işlem için hataları yakalayıp tüm işlemi durdurmak için --stop-on-error kullanabilirsiniz

""".format(", ".join(TARGET_FOLDERS)), Colors.CYAN)

def main():
    """
    Ana program fonksiyonu
    """
    global ALL_MARKDOWN_FILES, CANCELLATION_EVENT, ERROR_DETECTED
    
    # Komut satırı argümanlarını analiz et
    parser = argparse.ArgumentParser(description='Markdown dosyalarini topluca donusturme araci')
    parser.add_argument('--threads', '-t', type=int, help='Kullanilacak is parcacigi sayisi (varsayılan: otomatik)')
    parser.add_argument('--clean-output', '-c', action='store_true', help='Mevcut çıktı dosyalarını temizle ve çık')
    parser.add_argument('--clean-temp', action='store_true', help='Geçici dosyaları temizle ve çık')
    parser.add_argument('--verbose', '-v', action='store_true', help='Detayli cikti goster')
    parser.add_argument('--single-file', '-s', help='Sadece belirtilen dosyayi donustur')
    parser.add_argument('--chrome-path', help='Chrome/Chromium yürütülebilir dosyasının özel yolu')
    parser.add_argument('--disable-pdf', action='store_true', help='PDF dönüştürmeyi devre dışı bırak')
    parser.add_argument('--stop-on-error', action='store_true', help='Herhangi bir dosya dönüşümünde hata olursa tüm işlemi durdur')
    # PowerShell formatında yardım parametresi ekle (büyük H ile)
    parser.add_argument('-Help', action='help', help='Bu yardim mesajini gosterir (PowerShell formati)')
    # Tam yardım mesajı için ek bir parametre
    parser.add_argument('--full-help', '--detailed-help', action='store_true', help='Detayli yardim mesajini gosterir')
    # Sadece temizleme yapıp dönüşüm yapmamak için parametre
    parser.add_argument('--clean-only', action='store_true', help='Sadece temizleme yap, donusturme yapma')
    # Temizleme ve dönüştürme parametresi - bu normal bir dönüştürme için kullanılır
    parser.add_argument('--clean-convert', action='store_true', help='Temizle ve dönüştür (varsayılan davranış)')
    
    global args
    args = parser.parse_args()
    
    # Chrome path belirtildiyse ortam değişkenine ekle
    if args.chrome_path and os.path.exists(args.chrome_path):
        os.environ["PUPPETEER_EXECUTABLE_PATH"] = args.chrome_path
        print_color(f"[INFO] Özel Chrome yolu kullanılıyor: {args.chrome_path}", Colors.BLUE)
    
    # PDF dönüşümü devre dışı bırakıldıysa bilgi mesajı göster
    if args.disable_pdf:
        print_color("[INFO] PDF dönüşümü devre dışı bırakıldı. Sadece HTML ve diğer formatlar oluşturulacak.", Colors.BLUE)
    
    # Hata durumunda işlemlerin durdurulup durdurulmayacağı bilgisi
    if args.stop_on_error:
        print_color("[INFO] Herhangi bir dosya dönüşümünde hata olursa tüm işlem durdurulacak.", Colors.BLUE)
    
    # Tam yardım mesajını göster
    if hasattr(args, 'full_help') and args.full_help:
        show_detailed_help()
        return
    
    # Temizleme fonksiyonlarını ihtiyaca göre çağır
    cleaning_done = False
    
    # Geçici dosyaları temizle
    if args.clean_temp:
        # WORKING_DIR yerine DOCS_DIR kullan, eğer varsa
        if os.path.exists(DOCS_DIR) and os.path.isdir(DOCS_DIR):
            clean_temp_output_files(DOCS_DIR)
        else:
            clean_temp_output_files(WORKING_DIR)
        cleaning_done = True
    
    # Çıktı klasörünü temizle
    if args.clean_output:
        # WORKING_DIR yerine DOCS_DIR kullan, eğer varsa
        if os.path.exists(DOCS_DIR) and os.path.isdir(DOCS_DIR):
            clean_output_files(DOCS_DIR)
        else:
            clean_output_files(WORKING_DIR)
        cleaning_done = True
            
    # Sadece temizleme yapılacaksa veya -c veya --clean-temp parametresi kullanıldıysa,
    # veya --clean-only parametresi kullanıldıysa, dönüştürme işlemlerini atla
    if args.clean_only or args.clean_output or args.clean_temp:
        print_color("[INFO] Temizleme islemleri yapildi, donusturme islemi atlaniyor.", Colors.BLUE)
        return
    
    # Temizleme parametresi verilmemişse ve --clean-convert verilmişse, 
    # hem temizleme hem dönüştürme yap
    if args.clean_convert and not cleaning_done:
        # Hem geçici dosyaları hem de çıktı dosyalarını temizle
        if os.path.exists(DOCS_DIR) and os.path.isdir(DOCS_DIR):
            clean_temp_output_files(DOCS_DIR)
            clean_output_files(DOCS_DIR)
        else:
            clean_temp_output_files(WORKING_DIR)
            clean_output_files(WORKING_DIR)
            
    # Sinyal işleyicileri tanımla
    signal.signal(signal.SIGINT, handle_sigint)
    
    # Thread sayısını belirle
    thread_count = get_optimal_thread_count() if args.threads is None else args.threads
    
    # Markdown dosyalarını bul
    ALL_MARKDOWN_FILES = sorted(find_markdown_files(WORKING_DIR))
    total_files = len(ALL_MARKDOWN_FILES)
    
    if total_files == 0:
        print_color("[UYARI] Hic Markdown dosyasi bulunamadi!", Colors.WARNING)
        return
    
    print_color(f"[INFO] {total_files} Markdown dosyasi bulundu.", Colors.BLUE)
    print_color(f"[INFO] {thread_count} is parcacigi kullanilacak.", Colors.BLUE)
    
    # Chrome uzantıları için ortam değişkeni ayarlandı bilgisi
    if "CHROME_ENABLE_EXTENSIONS" in os.environ and os.environ["CHROME_ENABLE_EXTENSIONS"] == "1":
        print_color("[INFO] Chrome uzantilari etkinlestirildi (CHROME_ENABLE_EXTENSIONS=1)", Colors.BLUE)
    
    # PDF dönüşüm gereksinimleri hakkında bilgilendirme
    print_color("\n[ONEMLI BILGI] PDF donusumu icin gereksinimler:", Colors.HEADER)
    print_color("  • Marp PDF ciktisi icin Chrome/Chromium gerektirir.", Colors.CYAN)
    print_color("  • Puppeteer ile ilgili hatalar alirsaniz:", Colors.CYAN)
    print_color("    - 'Cannot find module puppeteer-core/internal' hatasi: Node.js surumu 14+ olmali", Colors.CYAN)
    print_color("    - 'Failed to launch the browser process' hatasi: Chrome kurulumunu kontrol edin", Colors.CYAN)
    print_color("    - 'Protocol error (IO.Read)' hatasi: Chrome 77+ gereklidir", Colors.CYAN)
    print_color("    - Windows'ta Chrome izinleri icin: icacls komutunu kullanin", Colors.CYAN)
    print_color("    - 'node_modules/.cache/puppeteer' klasorunu temizleyin", Colors.CYAN)
    print_color("  • PDF donusumunde sorun yasarsaniz, diger cikti formatlari yine de olusturulacaktir", Colors.CYAN)
    print_color("  • Sirket politikasi kisitlamalari icin: SET CHROME_ENABLE_EXTENSIONS=1 kullanin", Colors.CYAN)
    print_color("  • Detayli hata ayiklama icin '--verbose' parametresini kullanin\n", Colors.CYAN)
    
    # Tek bir dosya belirtilmişse sadece onu işle
    if args.single_file:
        if os.path.exists(args.single_file):
            print_color(f"[INFO] Sadece {args.single_file} donusturuluyor...", Colors.BLUE)
            start_time = time.time()
            result = convert_file(args.single_file)
            end_time = time.time()
            duration = end_time - start_time
            
            if result:
                print_color(f"[BASARILI] Dosya {duration:.2f} saniyede donusturuldu.", Colors.GREEN)
            else:
                print_color(f"[BASARISIZ] Dosya donusturulemedi. ({duration:.2f} saniye)", Colors.FAIL)
                print_color("\nHata Giderme Ipuclari:", Colors.WARNING)
                print_color("1. Chrome/Puppeteer Sorunlari:", Colors.WARNING)
                print_color("   • Hata: 'Failed to launch the browser process' veya 'Cannot find module puppeteer-core/internal'", Colors.WARNING)
                print_color("   • Cozum: Chrome/Chromium'un yuklu oldugunu ve erisilebilir oldugunu kontrol edin", Colors.WARNING)
                print_color("   • Cozum: 'npm install puppeteer' komutu ile Puppeteer'i guncelleyin", Colors.WARNING)
                print_color("   • Cozum: '--chrome-path C:\\Path\\To\\Chrome.exe' parametresiyle ozel Chrome yolu belirtin", Colors.WARNING)
                print_color("   • Cozum: 'SET CHROME_ENABLE_EXTENSIONS=1' komutunu calistirin (Kurumsal Chrome icin)", Colors.WARNING)
                print_color("2. Windows'ta Chrome izinleri:", Colors.WARNING)
                print_color("   • Komut: icacls \"%USERPROFILE%/.cache/puppeteer/chrome\" /grant *S-1-15-2-1:(OI)(CI)(RX)", Colors.WARNING)
                print_color("3. Daha fazla bilgi icin: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md", Colors.CYAN)
        else:
            print_color(f"[HATA] Belirtilen dosya bulunamadi: {args.single_file}", Colors.FAIL)
        
        return
    
    # İşlem başlangıç zamanını al
    start_time = time.time()
    
    # Thread havuzunu oluştur ve dosya dönüştürme işlerini gönder
    with ThreadPoolExecutor(max_workers=thread_count) as executor:
        # İlerleme kontrolcüsü
        progress_thread = threading.Thread(target=update_progress)
        progress_thread.daemon = True
        progress_thread.start()
        
        # Sonuçları takip etmek için liste
        future_to_index = {}
        results = [False] * total_files  # Başlangıçta tüm sonuçları başarısız olarak işaretle
        
        # Dosyaları işle - ThreadPoolExecutor.submit kullanarak daha iyi hata kontrolü sağla
        for i in range(total_files):
            if CANCELLATION_EVENT.is_set() or ERROR_DETECTED.is_set():
                break  # Hata varsa yeni iş gönderme
            
            future = executor.submit(worker, i)
            future_to_index[future] = i
        
        # Tamamlanan işleri takip et
        for future in as_completed(future_to_index):
            idx = future_to_index[future]
            try:
                result = future.result()
                results[idx] = result
                
                # Sonuç başarısız ve stop_on_error etkinse, diğer işlemleri durdur
                if not result and args.stop_on_error:
                    ERROR_DETECTED.set()
                    print_color(f"[KRITIK HATA] Dosya dönüşümü başarısız, tüm işlemler durduruluyor...", Colors.FAIL)
                    kill_all_processes()
                    break
                    
            except Exception as exc:
                print_color(f"[HATA] İş parçacığı {idx} istisna fırlattı: {exc}", Colors.FAIL)
                # İşlemci hatası durumunda tüm işlemleri durdur
                if args.stop_on_error:
                    ERROR_DETECTED.set()
                    print_color(f"[KRITIK HATA] Beklenmeyen bir hata oluştu, tüm işlemler durduruluyor...", Colors.FAIL)
                    kill_all_processes()
                    break
            
            # ERROR_DETECTED bayrağı ayarlanmışsa ve stop_on_error etkinse, tüm işlemleri durdur
            if ERROR_DETECTED.is_set() and args.stop_on_error:
                print_color(f"[BILGI] Hata bayrağı ayarlandı, diğer işlemler atlanıyor...", Colors.WARNING)
                break
        
        # İlerleme izleme thread'i durdur
        CANCELLATION_EVENT.set()
        progress_thread.join()
             
    # İşlem bitiş zamanını al ve süreyi hesapla
    end_time = time.time()
    duration = end_time - start_time
    
    # Sonuçları göster
    success_count = sum(1 for r in results if r)
    fail_count = total_files - success_count
    
    print("\n" + "="*60)
    print_color("ISLEM SONUCLARI", Colors.HEADER)
    print("="*60)
    print_color(f"Toplam dosya sayisi: {total_files}", Colors.BLUE)
    print_color(f"Basarili donusum: {success_count}", Colors.GREEN)
    
    if fail_count > 0:
        print_color(f"Basarisiz donusum: {fail_count}", Colors.FAIL)
        print_color("\nOLASI SORUNLAR VE COZUMLER:", Colors.WARNING)
        print_color("1. Chrome/Puppeteer Sorunlari:", Colors.WARNING)
        print_color("   • Hata: 'Failed to launch the browser process' veya 'Cannot find module puppeteer-core/internal'", Colors.WARNING)
        print_color("   • Cozum: Chrome/Chromium'un yuklu oldugunu ve erisilebilir oldugunu kontrol edin", Colors.WARNING)
        print_color("   • Cozum: 'npm install puppeteer' komutu ile Puppeteer'i guncelleyin", Colors.WARNING)
        
        print_color("2. Pandoc Sorunlari:", Colors.WARNING)
        print_color("   • Hata: 'pandoc: command not found' veya 'latexmk not found'", Colors.WARNING)
        print_color("   • Cozum: Pandoc ve LaTeX'in dogru sekilde yuklendiginden emin olun", Colors.WARNING)
        
        print_color("3. Dosya Izinleri:", Colors.WARNING)
        print_color("   • Hata: 'Permission denied' veya 'Access is denied'", Colors.WARNING)
        print_color("   • Cozum: Dosya ve klasor izinlerini kontrol edin", Colors.WARNING)
        
        print_color("\nDaha fazla yardim icin: https://github.com/marp-team/marp-cli/issues veya", Colors.CYAN)
        print_color("https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md", Colors.CYAN)
    
    print_color(f"Toplam sure: {duration:.2f} saniye", Colors.BLUE)
    print("="*60)
    
    # İşlemin sonuna geldiğimizde artık tuşa basma isteği olmadan doğrudan çık - bu konsol temizliğini önler
    return

if __name__ == "__main__":
    try:
        # Terminal boyutunu ayarla (Windows icin) - ekran temizlemeyi kaldırdık
        if sys.platform == 'win32':
            os.system('mode con: cols=120 lines=50')  # Ekranı temizlemek yerine daha büyük yapıyoruz
        
        print_color("""
==========================================
  MARKDOWN DOKUMAN DONUSTURME ARACI
==========================================

Bu script, belirlenen klasorlerdeki markdown dosyalarini cesitli formatlara donusturur:
- HTML slayt (marp)
- PDF slayt (marp)
- PPTX slayt (marp)
- PDF dokuman (pandoc)
- DOCX (pandoc)
- PPTX (pandoc)

KULLANIM SEÇENEKLERI:
--------------------
1. Normal Calistirma (Temizle + Donustur):
   python convert_all_markdown.py

2. Sadece Temizleme:
   python convert_all_markdown.py --clean-only

3. Farkli Dizin:
   python convert_all_markdown.py --dir baska_dizin

4. Thread Sayisi Belirtme:
   python convert_all_markdown.py --threads 4

5. Tek Dosya Testi:
   python convert_all_markdown.py --single-file path/to/file.md

6. Detayli Cikti:
   python convert_all_markdown.py --verbose

7. Geçici Dosyaları Temizleme:
   python convert_all_markdown.py --clean-temp

8. Özel Chrome Yolu Belirtme:
   python convert_all_markdown.py --chrome-path "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

9. PDF Dönüşümünü Devre Dışı Bırakma:
   python convert_all_markdown.py --disable-pdf

10. Hata Durumunda İşlemi Durdurma:
    python convert_all_markdown.py --stop-on-error

ISLENECEK KLASORLER:
-------------------
{0}

CHROME/PUPPETEER SORUNLARINI ÇÖZME:
----------------------------------
1. 'Failed to launch the browser process' hatası alıyorsanız:
   - CHROME_ENABLE_EXTENSIONS=1 ortam değişkenini ayarlayın:
     SET CHROME_ENABLE_EXTENSIONS=1 (Windows)
     export CHROME_ENABLE_EXTENSIONS=1 (Linux/Mac)
   
   - Chrome yolunu doğrudan belirtin:
     python convert_all_markdown.py --chrome-path "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
   
   - Chrome cache klasörünü temizleyin:
     rmdir /s /q %USERPROFILE%\\.cache\\puppeteer
   
   - Alternatif olarak, PDF oluşturmayı tamamen devre dışı bırakabilirsiniz:
     python convert_all_markdown.py --disable-pdf

2. Windows'ta Chrome izinleri:
   icacls "%USERPROFILE%/.cache/puppeteer/chrome" /grant *S-1-15-2-1:(OI)(CI)(RX)

3. 'Protocol error (IO.Read)' hatası alıyorsanız:
   - Chrome sürümünüzün 77 veya üstü olduğundan emin olun
   - npm update puppeteer ile Puppeteer'ı güncelleyin
   - Veya PDF oluşturmayı devre dışı bırakın: --disable-pdf

KONTROL:
-------
- İptal etmek için Ctrl+C tuşlarına basın (tüm işlemler anında durdurulur)
- Script çalışıyorken kapatmak zorunda kalırsanız, Task Manager/Görev Yöneticisi'nden Python işlemlerini sonlandırabilirsiniz
- Herhangi bir dosya işlenirken hata olursa tüm işlemleri durdurmak için --stop-on-error kullanın

UYARILAR:
--------
- Pandoc ve Marp kurulu ve çalışır durumda olmalıdır
- İşlem başlamadan önce tüm dosyaların kapalı olduğundan emin olun
- Büyük dosyalarda pandoc işlemi uzun sürebilir
- Marp PDF çıktısı için Chrome/Chromium gereklidir
- PDF oluşturmada sorun yaşıyorsanız --disable-pdf parametresini kullanabilirsiniz
- Güvenilir işlem için hataları yakalayıp tüm işlemi durdurmak için --stop-on-error kullanabilirsiniz

""".format(", ".join(TARGET_FOLDERS)), Colors.CYAN)
        
        # Parametresiz çalışma durumunda kullanıcıya onay sor
        if len(sys.argv) == 1:
            try:
                confirm = input("Tum dosyalari donusturmek istiyor musunuz? (e/h): ")
                if confirm.lower() not in ['e', 'evet', 'y', 'yes']:
                    print_color("Islem iptal edildi.", Colors.WARNING)
                    sys.exit(0)
            except:
                # CTRL+C veya başka bir kesme durumunda
                print_color("\nIslem iptal edildi.", Colors.WARNING)
                sys.exit(0)
        
        # Ana fonksiyonu çalıştır
        result = main()
        
        # Çıkış
        sys.exit(result)
    except KeyboardInterrupt:
        # Kullanıcı CTRL+C ile iptal etti
        CANCELLATION_EVENT.set()
        SCRIPT_IS_RUNNING = False
        print_color("\n[UYARI] Islem kullanici tarafindan durduruldu.", Colors.WARNING)
        sys.exit(1)
    except Exception as e:
        print_color(f"\n[HATA] Beklenmeyen hata: {str(e)}", Colors.FAIL)
        # Stack trace yazdırma (geliştiriciler için)
        import traceback
        traceback.print_exc()
        sys.exit(1) 