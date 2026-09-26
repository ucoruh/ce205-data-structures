---
marp: true
theme: default
style: |
    img[alt~="center"] {
      display: block;
      margin: 0 auto;
    }
_class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
header: 'Introduction to Data Structure'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-1'
title: "CE205 Data Structures Week-1"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Introduction to Data Structure"
geometry: "left=2.54cm,right=2.54cm,top=1.91cm,bottom=1.91cm"
titlepage: true
titlepage-color: "FFFFFF"
titlepage-text-color: "000000"
titlepage-rule-color: "CCCCCC"
titlepage-rule-height: 4
logo:
logo-width:
page-background:
page-background-opacity:
links-as-notes: true
lot: true
lof: true
listings-disable-line-numbers: true
listings-no-page-break: false
disable-header-and-footer: false
header-left:
header-center:
header-right:
footer-left: "© Dr. Uğur CORUH"
footer-center: "License: CC BY-NC-ND 4.0"
footer-right:
subparagraph: true
lang: en-US
math: katex
tags:
  - ce205-week-1
  - asn-1
  - ber-tlv
  - per-tlv
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

## Week-1

#### Course Plan and Communication, Course Plan and Communication, Introduction to Linear & Non-Linear Data Structure and Performance Analysis, Implementing Pointer and Objects for Data and Variables Basic of ASN.1 / BER TLV / PER TLV

Download [PDF](pandoc_ce205-week-1-intro.tr_doc.pdf),[DOCX](pandoc_ce205-week-1-intro.tr_word.docx), [SLIDE](ce205-week-1-intro.tr_slide.pdf), [PPTX](ce205-week-1-intro.tr_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-1-intro.tr_slide.html"></iframe>

---

### Outline

- Data States
- Data Structure Metrics 
- Data Mapping
- Data Structure Selection
- Data Structure References
- Industrial Data Standards (ASN.1,BER-TLV,etc.)
- Trends (Open API, 5G Systems etc.) 

---

## Introduction to Data Structures

---

### Data States

![center width:900px](https://lh4.googleusercontent.com/3kPUGkXoRyDKUZ-XG3I94EHvhwd8sqr2GjrCTV69Qj6UdezTirzRYh3-bgthUThwdJcxFxXLMnMIK60_tJZgObLVpjNTDswjx3He9tBBqtjj6PVpnxv5roky86klIVqglHVVDvlf)

---

### Data States

Data-in-use

- [Data in use - Wikipedia](https://en.wikipedia.org/wiki/Data_in_use) 

Data-in-transit

- [Data in transit - Wikipedia](https://en.wikipedia.org/wiki/Data_in_transit) 

Data-at-rest

- [Data at rest - Wikipedia](https://en.wikipedia.org/wiki/Data_at_rest) 

---

### Data Structure Metrics

Performance Analysis

- [Data Structures Tutorials - Performance Analysis with examples](http://www.btechsmartclass.com/data_structures/performance-analysis.html) 

Space Complexity

- [Data Structures Tutorials - Space Complexity with examples](http://www.btechsmartclass.com/data_structures/space-complexity.html) 

Time Complexity

- [Data Structures Tutorials - Time Complexity with examples](http://www.btechsmartclass.com/data_structures/time-complexity.html)

---

### Data Mapping

Data and Variables

- [C++ Data Types](https://www.tutorialspoint.com/cplusplus/cpp_data_types.htm)

---

### Data Structure Selection

Linear & Non-Linear Data Structures

- [Data Structures Tutorials - Linear and Non-linear types](http://www.btechsmartclass.com/data_structures/linear-non-linear-data-structures.html)

- [Data Structure and Types](https://www.programiz.com/dsa/data-structure-types) 

---

### Data Structure References

Implementing Pointer and Objects

- Check [CS50 Pointer Notes](files/CS50%20Modified.pdf)

- [Week 0 - CS50](https://cs50.harvard.edu/college/2021/fall/weeks/0/)

---

### Industrial Data Standards

- ASN.1 / BER TLV / PER TLV
  - http://lionet.info/asn1c/download.html
  - [GitHub - ucoruh/asn1c-wsl-sample: ASN.1 C WSL and Windows Execution, Debugging and Code Generation Sample](https://github.com/ucoruh/asn1c-wsl-sample)
  - [Open Source ASN.1 Compiler: asn1c 0.9.28](http://lionet.info/asn1c/download.html) 

---

### Industrial Data Standards - Telco

- Sample Standard for ASN.1 Usage
  
  - https://www.etsi.org/deliver/etsi_ts/125400_125499/125413/04.09.00_60/ts_125413v040900p.pdf

---

### Industrial Data Standards - Payment

- Payment BER TLV Parser Sample
  - [TLV Utilities](https://emvlab.org/tlvutils/?data=6F1A840E315041592E5359532E4444463031A5088801025F2D02656E)
  - https://paymentcardtools.com/

---

### Industrial Data Standards - Telco

#### ASN.1 Standartları

- ETSI
  - https://portal.etsi.org/Services/Centre-for-Testing-Interoperability/ETSI-Approach/Specification-Languages/ASN1
- ITU-T
  - https://www.itu.int/ITU-T/recommendations/fl.aspx?lang=1
- ASN.1 Book
  - https://www.oss.com/asn1/resources/books-whitepapers-pubs/dubuisson-asn1-book.PDF

---

#### Network Measurement Results Data

- NMR    
  - https://www.etsi.org/deliver/etsi_ts/101500_101599/101503/08.27.00_60/ts_101503v082700p.pdf
- GSM API
  - https://www.etsi.org/deliver/etsi_ts/101400_101499/101476/08.04.01_60/ts_101476v080401p.pdf
- UTRAN
  - https://www.etsi.org/deliver/etsi_ts/125300_125399/125331/13.01.00_60/ts_125331v130100p.pdf
- E-UTRAN
  - https://www.etsi.org/deliver/etsi_ts/136300_136399/136331/15.03.00_60/ts_136331v150300p.pdf

---

### Open Source 5G Projects

- [https://open5gs.org/](https://open5gs.org/)

- [5g nr development and setup · Wiki · oai / openairinterface5G · GitLab](https://gitlab.eurecom.fr/oai/openairinterface5g/-/wikis/5g-nr-development-and-setup)

---

### OPEN API

- Open API Generator
  - [https://openapi-generator.tech/](https://openapi-generator.tech/)
- Open API Yaml Configurations
  - [GitHub - jdegre/5GC_APIs: RESTful APIs of main Network Functions in the 3GPP 5G Core Network](https://github.com/jdegre/5GC_APIs)
- Open API AUSF Yaml Configuration 
  - https://www.etsi.org/deliver/etsi_TS/129500_129599/129509/17.06.00_60/ts_129509v170600p.pdf
  - https://www.etsi.org/deliver/etsi_TS/129500_129599/129509/17.06.00_60/ts_129509v170600p0.zip

---

$$
End-Of-Week-1
$$