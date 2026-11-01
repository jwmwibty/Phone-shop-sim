from pathlib import Path
import base64
root=Path('/home/user/phone-shop-src')
template=(root/'template.html').read_text()
font=base64.b64encode(Path('/home/user/manrope.woff2').read_bytes()).decode()
poster='data:image/jpeg;base64,'+base64.b64encode((root/'poster.jpg').read_bytes()).decode()
css=(root/'style.css').read_text().replace('__FONT__',font)
three=Path('/home/user/three.min.js').read_text()
game=(root/'game.js').read_text().replace('__POSTER__',poster)
result=template.replace('/*__CSS__*/',css).replace('/*__THREE__*/',three).replace('/*__GAME__*/',game)
Path('/home/user/phone-shop/index.html').write_text(result)
print('Built standalone game:', len(result),'characters')
