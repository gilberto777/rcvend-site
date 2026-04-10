from pathlib import Path
import os
import sys
import time
from typing import Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

SITE_URL = "https://gilcorretorsp.com.br"
IMAGES_DIR = r"C:\Users\Gilberto\Downloads\Vivaz Connection Adolfo Pinheiro"

DADOS_IMOVEL = {
    "titulo": "Vivaz Connection Adolfo Pinheiro – Aptos 1 e 2 Dorms perto do Metrô",
    "descricao": """Apartamento à venda no Vivaz Connection Adolfo Pinheiro, localizado em Santo Amaro, Zona Sul de São Paulo, a poucos minutos da estação de metrô Adolfo Pinheiro (Linha Lilás).

O empreendimento oferece apartamentos de 1 e 2 dormitórios com plantas inteligentes, metragem de 24 m² a 44 m², ideal para quem busca o primeiro imóvel ou uma excelente oportunidade de investimento.

Com lazer completo, o condomínio conta com piscina, academia, salão de festas, churrasqueira, playground, pet place e bicicletário, garantindo conforto e praticidade no dia a dia.

Localização privilegiada com fácil acesso ao Largo Treze, Mais Shopping, Sesc Santo Amaro, supermercados, escolas e ampla infraestrutura de comércio e serviços.

Condições facilitadas pelo programa Minha Casa Minha Vida, com possibilidade de uso do FGTS e subsídios do governo.

Entre em contato para mais informações e agende sua visita.""",
    "preco": "225000",
    "endereco": "Rua Doutor Antônio Bento, 104",
    "bairro": "Santo Amaro",
    "cidade": "São Paulo",
    "estado": "SP",
    "area": "24 a 44 m²",
    "banheiros": "1",
    "vagas": "0",
    "condominio": "Vivaz Connection Adolfo Pinheiro",
    "status": "Lançamento / Em construção",
    "previsao_entrega": "Dezembro de 2028 a Fevereiro de 2029",
}

EMAIL = os.getenv("GIL_LOGIN", "")
PASSWORD = os.getenv("GIL_PASSWORD", "")


def log(msg: str):
    print(f"[INFO] {msg}")


def warn(msg: str):
    print(f"[AVISO] {msg}")


def first_existing_file_list(folder: str):
    p = Path(folder)
    if not p.exists():
        raise FileNotFoundError(f"Pasta de imagens não encontrada: {folder}")
    files = []
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp"):
        files.extend(sorted(p.glob(ext)))
    return [str(f) for f in files if f.is_file()]


def safe_click(page, selectors, timeout=3000) -> bool:
    for sel in selectors:
        try:
            page.locator(sel).first.wait_for(state="visible", timeout=timeout)
            page.locator(sel).first.click(timeout=timeout)
            return True
        except Exception:
            continue
    return False


def safe_fill(page, selectors, value: str, timeout=3000) -> bool:
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout)
            loc.click(timeout=timeout)
            try:
                loc.fill("")
            except Exception:
                pass
            loc.press("Control+A")
            loc.press("Delete")
            loc.type(value, delay=20)
            return True
        except Exception:
            continue
    return False


def try_fill_by_label_or_placeholder(page, hints, value: str) -> bool:
    selectors = []

    for hint in hints:
        selectors += [
            f'input[placeholder*="{hint}" i]',
            f'textarea[placeholder*="{hint}" i]',
            f'input[name*="{hint.lower()}" i]',
            f'textarea[name*="{hint.lower()}" i]',
            f'input[id*="{hint.lower().replace(" ", "")}" i]',
            f'textarea[id*="{hint.lower().replace(" ", "")}" i]',
        ]

    if safe_fill(page, selectors, value):
        return True

    for hint in hints:
        try:
            page.get_by_label(hint, exact=False).click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Delete")
            page.keyboard.type(value, delay=20)
            return True
        except Exception:
            pass

    for hint in hints:
        try:
            label = page.locator(f'text="{hint}"').first
            if label.count() > 0:
                label.scroll_into_view_if_needed()
                label.click()
                page.keyboard.type(value, delay=20)
                return True
        except Exception:
            pass

    return False


def try_select_option(page, label_hints, option_text) -> bool:
    for hint in label_hints:
        try:
            page.get_by_label(hint, exact=False).select_option(label=option_text)
            return True
        except Exception:
            pass

    for hint in label_hints:
        try:
            page.locator(f'select[name*="{hint.lower()}" i], select[id*="{hint.lower()}" i]').first.select_option(label=option_text)
            return True
        except Exception:
            pass

    for hint in label_hints:
        try:
            page.locator(f'text="{hint}"').first.click()
            page.locator(f'text="{option_text}"').last.click()
            return True
        except Exception:
            pass

    return False


def wait_user_if_needed(page):
    log("Verificando se já está logado...")
    try:
        page.wait_for_load_state("networkidle", timeout=5000)
    except Exception:
        pass

    dashboard_markers = [
        'text=Dashboard',
        'text=Meus Imóveis',
        'text=Adicionar Imóvel',
        'text=Adicionar imóvel',
    ]

    if any(page.locator(sel).count() > 0 for sel in dashboard_markers):
        log("Sessão já parece estar logada.")
        return

    log("Tentando login automático.")
    login_done = False

    if EMAIL and PASSWORD:
        email_selectors = [
            'input[type="email"]',
            'input[name*="email" i]',
            'input[placeholder*="email" i]',
            'input[name*="login" i]',
        ]
        password_selectors = [
            'input[type="password"]',
            'input[name*="senha" i]',
            'input[placeholder*="senha" i]',
            'input[name*="password" i]',
        ]
        safe_fill(page, email_selectors, EMAIL)
        safe_fill(page, password_selectors, PASSWORD)

        if safe_click(page, [
            'button:has-text("Entrar")',
            'button:has-text("Login")',
            'input[type="submit"]',
        ]):
            login_done = True

    if not login_done:
        warn("Não consegui concluir o login automático. Faça login manualmente.")
        input("Depois de logar e chegar no painel, pressione ENTER aqui... ")
    else:
        time.sleep(3)

    log("Continuando após verificação de login.")


def navigate_to_new_property(page):
    log("Indo para o painel.")
    page.goto(SITE_URL, wait_until="domcontentloaded")

    possible_targets = [
        f"{SITE_URL}/dashboard",
        f"{SITE_URL}/painel",
        f"{SITE_URL}/admin",
    ]

    for url in possible_targets:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=8000)
            if page.locator('text=Dashboard').count() > 0 or page.locator('text=Meus Imóveis').count() > 0:
                break
        except Exception:
            continue

    log("Tentando abrir Adicionar Imóvel.")
    clicked = safe_click(page, [
        'text=Adicionar Imóvel',
        'text=Adicionar imóvel',
        'text=Novo Imóvel',
        'text=Novo imóvel',
        'text=Meus Imóveis',
        'button:has-text("+")',
        'a:has-text("+")',
    ], timeout=2500)

    if page.locator('text=Meus Imóveis').count() > 0:
        safe_click(page, [
            'text=Adicionar Imóvel',
            'text=Adicionar imóvel',
            'text=Novo Imóvel',
            'text=Novo imóvel',
            'button:has-text("+")',
            'a:has-text("+")',
        ], timeout=2500)

    time.sleep(2)

    if not clicked and page.locator('text=Salvar Imóvel').count() == 0 and page.locator('text=Salvar imóvel').count() == 0:
        warn("Não consegui chegar sozinho no formulário. Abra manualmente a tela 'Adicionar Imóvel'.")
        input("Quando a página 'Adicionar Imóvel' estiver aberta, pressione ENTER aqui... ")


def fill_form(page):
    log("Preenchendo título.")
    ok = try_fill_by_label_or_placeholder(
        page,
        ["Título do Anúncio", "Título", "Ex: Apartamento de Luxo na Vila Mariana"],
        DADOS_IMOVEL["titulo"],
    )
    if not ok:
        warn("Não consegui preencher o Título automaticamente.")

    log("Preenchendo descrição.")
    try_fill_by_label_or_placeholder(
        page,
        ["Descrição", "Detalhes", "Descrição do imóvel"],
        DADOS_IMOVEL["descricao"],
    )

    log("Preenchendo preço.")
    try_fill_by_label_or_placeholder(
        page,
        ["Preço", "Valor", "Preço do imóvel"],
        DADOS_IMOVEL["preco"],
    )

    log("Preenchendo endereço.")
    try_fill_by_label_or_placeholder(
        page,
        ["Endereço", "Rua", "Logradouro"],
        DADOS_IMOVEL["endereco"],
    )

    log("Preenchendo bairro.")
    try_fill_by_label_or_placeholder(
        page,
        ["Bairro"],
        DADOS_IMOVEL["bairro"],
    )

    log("Preenchendo cidade.")
    try_fill_by_label_or_placeholder(
        page,
        ["Cidade"],
        DADOS_IMOVEL["cidade"],
    )

    log("Preenchendo estado.")
    if not try_select_option(page, ["Estado", "UF"], DADOS_IMOVEL["estado"]):
        try_fill_by_label_or_placeholder(page, ["Estado", "UF"], DADOS_IMOVEL["estado"])

    log("Preenchendo área.")
    try_fill_by_label_or_placeholder(
        page,
        ["Área", "Área útil", "Metragem"],
        DADOS_IMOVEL["area"],
    )

    log("Preenchendo banheiros.")
    try_fill_by_label_or_placeholder(
        page,
        ["Banheiros", "Banheiro"],
        DADOS_IMOVEL["banheiros"],
    )

    log("Preenchendo vagas.")
    try_fill_by_label_or_placeholder(
        page,
        ["Vagas", "Garagem"],
        DADOS_IMOVEL["vagas"],
    )

    log("Preenchendo condomínio.")
    try_fill_by_label_or_placeholder(
        page,
        ["Condomínio", "Nome do condomínio"],
        DADOS_IMOVEL["condominio"],
    )

    log("Preenchendo status.")
    if not try_select_option(page, ["Status"], DADOS_IMOVEL["status"]):
        try_fill_by_label_or_placeholder(page, ["Status"], DADOS_IMOVEL["status"])

    log("Preenchendo previsão de entrega.")
    try_fill_by_label_or_placeholder(
        page,
        ["Previsão de entrega", "Entrega"],
        DADOS_IMOVEL["previsao_entrega"],
    )


def upload_images(page):
    files = first_existing_file_list(IMAGES_DIR)
    if not files:
        warn("Nenhuma imagem encontrada.")
        return

    log(f"Encontradas {len(files)} imagens.")

    file_inputs = page.locator('input[type="file"]')
    count = file_inputs.count()

    if count > 0:
        for i in range(count):
            try:
                file_inputs.nth(i).set_input_files(files)
                log("Upload enviado para input[type=file].")
                time.sleep(3)
                break
            except Exception:
                continue
    else:
        warn("Não achei input[type=file]. Tente clicar manualmente no botão de mídia antes de continuar.")
        input("Abra a área de upload de imagens no navegador e pressione ENTER aqui... ")
        file_inputs = page.locator('input[type="file"]')
        if file_inputs.count() > 0:
            file_inputs.first.set_input_files(files)
            log("Upload enviado após abertura manual da galeria.")
            time.sleep(3)
        else:
            warn("Ainda não encontrei input de arquivo.")

    try:
        safe_click(page, [
            'text=Definir como capa',
            'text=Imagem principal',
            'text=Capa',
            'button:has-text("Capa")',
        ], timeout=2000)
    except Exception:
        pass


def save_property(page):
    log("Tentando salvar imóvel.")
    ok = safe_click(page, [
        'button:has-text("Salvar Imóvel")',
        'button:has-text("Salvar imóvel")',
        'text=Salvar Imóvel',
        'text=Salvar imóvel',
        'input[type="submit"]',
    ], timeout=4000)

    if not ok:
        warn("Não consegui clicar em 'Salvar imóvel'. Clique manualmente no navegador.")
        input("Depois de salvar, pressione ENTER aqui... ")
        return

    time.sleep(5)


def show_final_url(page):
    log(f"URL atual: {page.url}")
    print("\n=== LINK FINAL ===")
    print(page.url)
    print("==================\n")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.goto(SITE_URL, wait_until="domcontentloaded")
        wait_user_if_needed(page)
        navigate_to_new_property(page)

        input("Quando a tela de cadastro estiver aberta e visível, pressione ENTER para preencher... ")

        fill_form(page)
        upload_images(page)

        print("\nRevise no navegador se os campos ficaram corretos.")
        input("Se estiver tudo certo, pressione ENTER para tentar salvar... ")

        save_property(page)
        show_final_url(page)

        input("Pressione ENTER para encerrar...")
        browser.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nEncerrado pelo usuário.")
        sys.exit(0)