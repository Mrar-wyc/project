import fitz
doc = fitz.open(r'c:\Users\31215\Downloads\项目优化方向.pdf')
for page in doc:
    print(page.get_text())
