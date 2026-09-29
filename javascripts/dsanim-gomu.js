/* Gömülü animasyon oynatıcılarından gelen yükseklik iletisiyle iframe boyunu ayarlar (taşma ve iç kaydırma olmasın). */
window.addEventListener('message', function (e) {
  var d = e.data;
  if (!d || !d.dsanim || !d.yukseklik) return;
  var cerceveler = document.querySelectorAll('iframe.dsanim');
  for (var i = 0; i < cerceveler.length; i++) {
    if (cerceveler[i].contentWindow === e.source) cerceveler[i].style.height = (d.yukseklik + 2) + 'px';
  }
});
