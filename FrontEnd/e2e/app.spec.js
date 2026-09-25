import { expect, test } from '@playwright/test';

const users = [
  { id: '1', username: 'ana', full_name: 'Ana Silva', department: 'Produto' },
  { id: '2', username: 'bia', full_name: 'Bia Lima', department: 'TI' },
];
const realtime = [
  { username: 'ana', status: 'online', seconds_since_last_activity: 4, process_name: 'Editor' },
];

async function mockApi(page) {
  await page.route('http://localhost:8000/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/users/') return route.fulfill({ json: users });
    if (url.pathname === '/activities/realtime') return route.fulfill({ json: realtime });
    if (url.pathname === '/dashboard/summary') {
      return route.fulfill({
        json: {
          date: url.searchParams.get('date'),
          users: users
            .filter(
              (user) =>
                !url.searchParams.get('username') ||
                url.searchParams.get('username') === user.username,
            )
            .map((user) => ({
              username: user.username,
              total_seconds: 3600,
              by_category: [{ category: 'Trabalho', total_seconds: 3600 }],
            })),
        },
      });
    }
    if (url.pathname === '/config/') {
      return route.fulfill({
        json:
          route.request().method() === 'PUT'
            ? JSON.parse(route.request().postData())
            : { capture_interval_seconds: 10, idle_timeout_seconds: 300 },
      });
    }
    if (url.pathname === '/dashboard/export/csv') {
      return route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'username,category,total_seconds\nana,Trabalho,3600\n',
      });
    }
    if (url.pathname === '/dashboard/export/pdf') {
      return route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n' });
    }
    return route.fulfill({ status: 404, json: { detail: 'Rota não encontrada' } });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('abre o painel, filtra data e usuário e navega até a rota 404', async ({ page }) => {
  await page.goto('/#/painel');
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  await expect(page.getByRole('table').first()).toContainText('Ana Silva');
  await page.getByLabel('Data do resumo').fill('2026-09-24');
  await page.getByRole('combobox', { name: 'Usuário' }).selectOption('ana');
  await expect(page.getByLabel('Indicadores disponíveis')).toContainText('1h 00min');
  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: 'Colaboradores' })
    .click();
  await expect(page.getByRole('heading', { name: 'Colaboradores' })).toBeVisible();
  await page.goto('/#/inexistente');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});

test('mostra falha da API e recupera a lista ao tentar novamente', async ({ page }) => {
  let attempts = 0;
  await page.route('http://localhost:8000/users/', async (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 503, json: { detail: 'Serviço temporariamente indisponível' } })
      : route.fulfill({ json: users });
  });
  await page.goto('/#/colaboradores');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('table')).toContainText('Ana Silva');
});

test('mostra falha de conexão com API offline e recupera após retry', async ({ page }) => {
  let offline = true;
  await page.route('http://localhost:8000/users/', (route) =>
    offline ? route.abort('failed') : route.fulfill({ json: users }),
  );
  await page.goto('/#/colaboradores');
  await expect(page.getByRole('alert')).toContainText('Não foi possível conectar à API');
  offline = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('table')).toContainText('Ana Silva');
});

test('lê e salva configurações com GET e PUT', async ({ page }) => {
  const put = page.waitForRequest(
    (request) => request.method() === 'PUT' && request.url().endsWith('/config/'),
  );
  await page.goto('/#/configuracoes');
  await expect(page.getByLabel('Intervalo de captura (segundos)')).toHaveValue('10');
  await page.getByLabel('Limite de inatividade (segundos)').fill('240');
  await page.getByRole('button', { name: 'Salvar configurações' }).click();
  const request = await put;
  expect(request.postDataJSON()).toEqual({
    capture_interval_seconds: 10,
    idle_timeout_seconds: 240,
  });
  await expect(page.getByText('Configurações salvas.')).toBeVisible();
});

test('baixa CSV e PDF no navegador', async ({ page }) => {
  await page.goto('/#/relatorios');
  for (const format of ['CSV', 'PDF']) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: `Exportar ${format}` }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toMatch(
      new RegExp(`^resumo_\\d{4}-\\d{2}-\\d{2}\\.${format.toLowerCase()}$`),
    );
    expect(await download.failure()).toBeNull();
  }
});

test('menu móvel aceita teclado e tema escuro', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/#/painel');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu principal mobile' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Menu principal mobile' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Tema escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
]) {
  test(`sem rolagem horizontal na página em ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#/painel');
    await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

for (const route of ['colaboradores', 'relatorios', 'configuracoes']) {
  test(`${route} cabe em 390px sem rolagem da página`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  });
}

test('conteúdo permanece utilizável com ampliação CSS de 200%', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/#/painel');
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  await expect(page.getByLabel('Tabela de última atividade com rolagem horizontal')).toBeVisible();
});
