import urllib.request
import os

male_url = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop"
female_url = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop"

base_dir = r"d:\Downloads\quick_clothing\frontend\public\ai-models"
os.makedirs(base_dir, exist_ok=True)

urllib.request.urlretrieve(male_url, os.path.join(base_dir, "base_male.jpg"))
urllib.request.urlretrieve(female_url, os.path.join(base_dir, "base_female.jpg"))
print("Downloaded base models.")
