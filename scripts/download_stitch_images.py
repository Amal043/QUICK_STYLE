import os
import requests

URLS = {
    "hero1.jpg": "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=2000&auto=format&fit=crop",
    "hero2.jpg": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop",
    "hero3.jpg": "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop",
    "hero4.jpg": "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=2000&auto=format&fit=crop",
    "mini_front.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuDVAN6Z4k-hsjSRtWuPx83zSJsFy-5hP2inB7zRE6K7rOLdZHhTy8b9k9oBc7n5tJSsmnrvRj6Jp17w7CqrjebEcfn6tk1UaUodhLc8w42ygB_AbkUsneZjJVQBC7tB_3nA9KM2gEXG7ckUwTsayZVfWtNUTHonLoL5XLCKnIqbp8e6vVMqJxbnTECUnA1R3NYIluXTlw4kTPwmkzYLxVq_fECIRMlBMLlfKOLZWcfy5QwRqjLX1-Q8hoehogbo7KHsGctS10B0Zwo",
    "mini_side.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuC4u8ND6nL2hd90ac847_cgQA-HerVucxqw9hAm4r-McqfMAT79Clh7RSje9ygc5B_oPKc4wZEs2XOrQTPCasGfFg37HLcHnOvWZHI-MzpZ1N8VJecLI1sB-SG3Gte1w4BQvV52TUcZXkY_esJ_fViIugTeDxCg-ZGfyumBI_wTqUD3LLcE-rShVIoTaeRzzxjok_-hS_D0CjVSs4eCcSv4mMbginP742Ihq4Lmu9SRCl6__58BpkH1sIOJNiFt9xLByhzkvYRQ41M",
    "midnight_front.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuBGW5BjCPO0dac7M_tc3Fo8toUGVItSfNcXDwo9CRkup6z-j6nbhM8ivB1gUuXkpkO1PFg8g047K7xtNdcQU1CAn6aAhxVDuhBog4HgzYOLPqqrGOg6ogWB8Xd2_z6ewDaiAdiFNdNXnaPSjOggH8knXc3A3PcjDEgrEXgfoMoQxe_bYm5cNDaFXnZcYh0qCvkXDSQLXmWgcgGzFNUyLMq9wAr-PfZijvr_kC081JjmlDKP6jISEPA4PLNw5si6jp4adJgm55-M6KA",
    "midnight_side.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuCeOx319-tcgtu6zh_xI0SJ14igQc6xLbzmLRklQG0qHlIMSOfCba0kllbWgBbL8iTX8Q2yJnuNVYG22DzZotyFYiNZuar_gNd4TXOaJ01ikVYvb6l6bdKuTbQoofrJWdtCzkOHKNSyVPo54qER9P7NJrcHEI6k6MFLr8dVieSMs036UNoPX8uaaV10ABqcHWcbX4D-5VHslZ73bZyTIH67tvyEg8ZcsLzNTxqV9ZXdsdM9zqxF1tbkNQYYXH18pdnIwMGWxQA07EM",
    "blazer_front.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuDhff3ZGYzFrAPyEdFIYObcTMhgGHEB5F_fWgDyDe8H_xU6V4wcI-uD9pjBbVHLpgF2JYwPtLeDdGQACT6veRzQVeF8yw233k52X9_3brIQQGrBYq9OksuHqL-ocR91stOVLOBJmseqmCoM5234QjlE_PoIH1SBe8z3e6T23Z2uPAXMv3yRzIn9jyk0F52QK6DwEjnRps4h7z-quhiv-OzcB4owVyTNsUpauD-7dJsmomNot6_eW51-TMncO7VzRk1SdyNGfiKgDk0",
    "blazer_side.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ib12PxUibkDSXPFOgpryVSWk_KUKWVhY_QhSS08zVRQBZWvCp95aG3dOgbBAR5PNOKOev-3FcdyJ23ChvO-P0XDrvFEsyCk0hSjYef-rrVAOmSICt7tAJMc2Ll1P7IOLsxBH_Lw1qFVXTDvMOn2HYuWTbFkW4VbSWyEx0Epo9opT0NGmijYzxviivTTfMrhWtl_hIqyN6QfH4g-NfgDVgZe3aWzhJODbIDfD3oOcOchXBBlAULjBvjp67Y_BuQmH2yPxSYMaLhw",
    "editorial_hero.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuB50nk0X_Se8hSoXyp5mjvjmTEnEOxAGUpXg0AjCgNnifXTXfTj6daMzf2oBYws184A2xd6YRn4bLcJQdqGjRD2teSFb8It_ok3DbWmt59BRr8NP9RKD04NJ5JPZwLJZoz2gBKQ9iY_C2Q5CR0m3zIo9Lcoj2w7Y-PlHkKg8cqPEIp9WnsvvWGmQywMxmJBgKPkD9ga2ewLGW2t8Dld1IpYeldlHw-zy4wdR-jMx3mabWi_yD-kl76UTw-QojlcKCjDSiIhRCnxvnI",
    "ribbed_knit.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuDzI2T9uzFwKjnoNm6E8bM9z_RapF0JoQo0wJ_v0f1ImjM1xPUz-iPJhPv97cm2T-AaKwoNC-ygxegS3H2ex7WX4_ntkibcRnvVrPDlsNFE9EStiSZHhSohk9bSBRKhrE4zKWv_aty1rSE6WzTV75G9lLkw4r4ajOmIZcC9k0daUDArwCPOpndqaw3AnQsJpkVqOQj1tKj0H3S-3kwrfriPMGxK3yW1jZbURdDHRSulnRPpp7Wni0UlyH7I3ogJgVvurlPsnfx1ftY",
    "arch_blazer.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuBVqziCTSMJRrxhu68EPmr7mwSg17WDLJMWng7e11XuJh7qz13RPHlXkMLv6laQD_FnxhlK1GNHjYpNvsB4U8tTU3YsMwwVEE_eh0FD9851cSKZLMyFZV3M3TEzdDfuTya6PR43yXit8y5Zhr72NhP1di05GDd8Mw4WWliRJP4OabcH6ealbtKsZ1-3U59xwUK9UDl1JqfOe_ftAVbj52Ry_pZytnhhZKhU0zB8i3H2lyUWHQNdD4fWb9dMK65Gi0ohKbkX7NfLwWs",
    "combat_boot.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuDu13itmvPizT9aqFICyHhUAZ72tPM88y6nUGqA2nVwHgI0DKyR9ZZ9PGGL0-OoOnJ_DxbKi8WuiAENeKhLFO1BpiOZTrww9IgTTvWu8QeSxv0slpaCFBva0yCwDicYguLXWV_PBF4_krNXWxnm-8G0FldXdkGcFgRN6M2uEcrzbupyRBXttrRvsuIqifzwpNOJPUj8WrM-uKkfJi7DD7yCb2BliN2LeuQtvL_XKDJRuHMIgnrqwOGtlRCKfJ9E66D_8lh6NMQ5aqg",
    "heavyweight_tee.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuAM9tkXipa4_k6xAhUxrwhUfozIYIO9jOOZyPieDWXlffOPsPZPZ3MPLrZzHAo-LEeOaWWF4hzV5_9JAWkWzEPysmReE5OSHbSUP8aXPc8Opz8BX1q7aKZduGyAQTX8htZcbY6E5cWj1cshD9KuRs0DgZM7fvtGCpf2WaclZYsoioyRTx79TxoKNOgoWrS7aW-2TxuP7VQQ2mSdQJv-RNn_J2PSRXU8jmVeZE0Kao4SkHLH6Ca68-M9ctalR6kMSMhCq-jwC_gOers",
    "silk_tunic.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuA2l9-IZ_WpcfFqDn2JppZJT0P_b5CqE7A9Nli0PSilxHbUO_M5LvK6ntX75Ip7eiiBPPnC6A_Qg1JEC5BugPJyIncR5iTcQhAktTRKHSyjk47hWDcFOzgWB6tmRakiI0trK1k0j3sgTKLdHQFTOaSu4PC5QOXyh7eWiqoZOt2JAjWfDUdRLQQC5FC2EPUs8_pHC9AqIBUDQZfeHreecFCU8zlVlRE1xdWskOntmdvBuC3mhx5Z4Ve9nwG5ZPOC1wLsZjYl9FmMhpE",
    "precision_trousers.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuCOGEeNsnNzzBItBMtHI4XNlgUjIY5DMUN5UvdiZee3k797Mc1f6ZpxWSPqHsmp6jc1fRyKo6VF58E23vGrYwjr1K_3AgOWIJHytTrKT_CHomPftbr31Bn_QD-PRH8Eb2yWnpRz1mYxWOWHB5khXr8qtkCMDq-NjbLfQsFwAjK0h5xNJswnRjNpi21o1LufkYXRyyK9zU_4hfISmRGPGKoGvJXZRLLVFFVz7K05dcvfTLqc4DYno01SWE7WIwouYNOvKyOvpateP4I",
    "obsidian_gown.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuD3lmY5zrCPQQQVcxrfZ-mC2V4YwXdk_5wkdjclK5DbzGsrvsWI8F3OGSPxxgzwPboCc7nV_OPHM9_O4KsAZ6039VhKBQxS36WIWH7vrSYhgyQ7mvdDVTuL2WTRooR8fpqohEpEFHum7oyJQHckEO4pZjsz-L8kaI-0Oz80qRe67D_N4oH12pS6sPcmCZKsXDKqKTV6QZSwf0EKZAsADwgKe5ms758upklQVaY8jIgPpWulevhIp_nM7_U1Aafk6FUQeuPoBndbLko",
    "gown_detail1.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuD_TJS9pOXdzOZglqRS9gl9retcA2zxX2ofxdua-0x8s_8P0xBk7SKV2d9CeQO5zA1Eb5LOEsXAYjobQd42dVFuQnyMzzVPAQ9hD_S1dPcsc3pjHb62z8lfgU-AmIx7VBIX-KaWPd3e3XpYOT9jix5i0RWLVNKm4ZlXKEhogyiV-ZIK48WLoNVnYysiBZBBvIZF955BSAapXIiw_K-SZ4OWllAPsrLvZ_sb82qhPIjtgwnVUiEdogheMXoiggjS6aU223JwhKmdG2g",
    "gown_detail2.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuDJP_P7EQ2wxMxsdNu8f9Re0LmuSNDgjmnu5D1RzxilJ8KWqIX745nQq6v5JRa_DbM7tjTExA2MLJGtzJrwuIgffVJi0iJ_NLe2uiKkHsTqKRV8CGP7_YxJk4YFfkx9oZ15-gFOXyKEsNTMdgFuLoMMV8PC8KBOqPdPS7ZMWrmXOqM3vub3FgCESyy0raFqCUq4HzkBKy6g22jMXq-fmr-0OpVP4FNzVdud-uFYBKupNnB2gDlyGwZCpmLhtKLqtZR1MwKPfI9jZOs",
    "arch_cuff.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuC2qs1oupa3ZbRfd9dvwP7CuX_zg8o0g58Ly5_5RGWPoXlawJ8gV-7WZw2a5hNbDWQywoNv9yH1lPzJwnvI-9RQf1Osbi7WvVnoFMXHDWwrbwKyQyhEgTXYAOips-0pFJ59wX0dBXPJaV52-d9OEdXcBZQkgV5moKrOO40jEgC-5QSWu2cYtSoB7HDmR8GlPOnIcRCy1ysCfc_zl7IXWDc7WnmX8ycADlX9dVZ0UhOp-wKDINlY68rWUOZ5uQpnzJKMst0NzS0orDM",
    "noir_stiletto.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyxgUxfPGB0TnIz7gJ71fEPPa_H0E3TFPhrwFwxXOfA0a97de5aDUqjqjLuXH0hyZcJ_sO0jouFk4K_sTtihSabm5ccX37KvutYDew_NsLBnbvCxy933gTcgobZ6twuja3HAjGdhSDziZ2_NeBxxBc5u1VMgCPbHbXf-6uGkVWvOFl8zUWL9KjFsGY5eyM6mpYUpGOTHlEmS6qyZXLJqMlc9HrpWMTtckud6pHvQWZ5B7PM-ngDn6wlTIN9MDVnNNiJrD8nSSKBzI",
    "minaudiere.jpg": "https://lh3.googleusercontent.com/aida-public/AB6AXuD7bYvXfo6g6fPCO9U1h-AYMtNbc5cDErQRzZAwu4UuKQYskoPq9H1wYDV3_0t2GQ8QnM8gFJor3OKtpFYZ2Wc06KLpf4Nue16Xstn5jMu0cs7HwfoRmp8bwiifDQuag4F6GwJqudPAtNKlYjBdM9-VfHjIM6fNxO6ONrKfn4EQoRbiCBLG65R3YIXv3YzJWOZv4A84b2KiJkxiNaEFJgjP6aaGWgYspERYcfdTHxTTRcpT5UyR8-g1pKyRaZWthZ5mrmXiVi-WxJA"
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public", "stitch")

if __name__ == "__main__":
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    for filename, url in URLS.items():
        filepath = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(filepath):
            print(f"Skipping {filename}, already exists.")
            continue
            
        print(f"Downloading {filename}...")
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            with open(filepath, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
