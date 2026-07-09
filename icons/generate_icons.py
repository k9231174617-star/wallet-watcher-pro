from PIL import Image, ImageDraw, ImageFont
import os

# Create base 1024x1024 icon
size = 1024
img = Image.new('RGBA', (size, size), (4, 5, 8, 255))  # --bg-void #040508

# Draw radial gradient background (cyan glow)
for y in range(size):
    for x in range(size):
        dx = x - size/2
        dy = y - size/2
        dist = (dx**2 + dy**2)**0.5
        max_dist = size * 0.7
        alpha = int(255 * max(0, 1 - dist/max_dist) * 0.12)
        if alpha > 0:
            img.putpixel((x, y), (0, 245, 255, min(alpha, 35)))

draw = ImageDraw.Draw(img)

# Draw main wallet shape (rounded rect with neon border)
center = size // 2
wallet_w = size * 0.5
wallet_h = size * 0.35
wx = center - wallet_w/2
wy = center - wallet_h/2
radius = 30

# Wallet body with gradient
for i in range(int(wallet_h)):
    progress = i / wallet_h
    r = int(12 + progress * 20)
    g = int(21 + progress * 30)
    b = int(37 + progress * 50)
    y0 = int(wy + i + 4)
    y1 = int(wy + wallet_h - 4)
    if y1 > y0:
        draw.rounded_rectangle(
            [wx + 4, y0, wx + wallet_w - 4, y1],
            radius=radius - 4,
            fill=(r, g, b, 255)
        )

# Neon cyan border glow
for glow in range(8, 0, -1):
    alpha = int(255 * (glow / 8) * 0.3)
    draw.rounded_rectangle(
        [wx - glow, wy - glow, wx + wallet_w + glow, wy + wallet_h + glow],
        radius=radius + glow,
        outline=(0, 245, 255, alpha),
        width=2
    )

# Main border
draw.rounded_rectangle(
    [wx, wy, wx + wallet_w, wy + wallet_h],
    radius=radius,
    outline=(0, 245, 255, 200),
    width=3
)

# Blockchain symbols inside wallet
symbols = [
    ('◎', 0.2, 0.35, '#9945ff'),   # Solana
    ('⬡', 0.4, 0.35, '#627eea'),   # Ethereum
    ('🔶', 0.6, 0.35, '#f3ba2f'),  # BNB
    ('🔷', 0.8, 0.35, '#0052ff'),  # Base
    ('💎', 0.5, 0.7, '#0098ea'),   # TON
]

try:
    font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 80)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

for sym, rel_x, rel_y, color in symbols:
    x = center + (rel_x - 0.5) * wallet_w * 0.8
    y = wy + rel_y * wallet_h
    # Glow effect
    for offset in [(2,2), (-2,2), (2,-2), (-2,-2), (0,0)]:
        draw.text((x + offset[0], y + offset[1]), sym, font=font_large, fill=color, anchor='mm')

# "WALLET WATCHER" text at bottom
try:
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
except:
    font_title = ImageFont.load_default()

draw.text((center, wy + wallet_h + 60), "WALLET WATCHER", font=font_title, fill=(0, 245, 255, 255), anchor='mm')
draw.text((center, wy + wallet_h + 100), "PRO", font=font_small, fill=(255, 215, 0, 255), anchor='mm')

# Save master icon
output_dir = '/root/Documents/Codex/2026-07-08/new-chat/wallet-watcher-pro/icons'
img.save(os.path.join(output_dir, 'icon-1024x1024.png'))
print("Created master icon: icon-1024x1024.png")

# Generate all required sizes
sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    resized.save(os.path.join(output_dir, f'icon-{s}x{s}.png'))
    print(f"Created icon-{s}x{s}.png")

# Create adaptive icon foreground (for Android)
adaptive = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
ad_draw = ImageDraw.Draw(adaptive)
# Simplified wallet icon for adaptive
ad_draw.rounded_rectangle([50, 80, 382, 280], radius=30, fill=(12, 15, 26, 255), outline=(0, 245, 255, 255), width=6)
# Add symbols
for sym, rel_x, rel_y, color in symbols[:4]:
    x = 216 + (rel_x - 0.5) * 250
    y = 180 + (rel_y - 0.35) * 150
    try:
        ad_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 70)
    except:
        ad_font = ImageFont.load_default()
    ad_draw.text((x, y), sym, font=ad_font, fill=color, anchor='mm')

adaptive.save(os.path.join(output_dir, 'icon-adaptive-foreground.png'))
print("Created adaptive icon foreground")

# Create splash screen (for Capacitor SplashScreen plugin)
splash_sizes = [
    (2732, 2732, 'splash-2732x2732.png'),  # iPad Pro
    (1242, 2688, 'splash-1242x2688.png'),  # iPhone XS Max
    (1125, 2436, 'splash-1125x2436.png'),  # iPhone X/XS
    (828, 1792, 'splash-828x1792.png'),    # iPhone XR
    (750, 1334, 'splash-750x1334.png'),    # iPhone 8
]

for w, h, fname in splash_sizes:
    splash = Image.new('RGBA', (w, h), (4, 5, 8, 255))
    # Center the logo
    logo_size = min(w, h) * 0.3
    logo = img.resize((int(logo_size), int(logo_size)), Image.Resampling.LANCZOS)
    splash.paste(logo, ((w - logo.width)//2, (h - logo.height)//2), logo)
    splash.save(os.path.join(output_dir, fname))
    print(f"Created {fname}")

print("\nAll icons generated successfully!")
