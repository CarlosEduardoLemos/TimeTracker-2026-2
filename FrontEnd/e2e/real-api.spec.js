import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const configured =
  process.env.RUN_REAL_API && process.env.REAL_API_EMAIL && process.env.REAL_API_PASSWORD;
test.skip(
  !configured,
  'Requer FastAPI em execução, RUN_REAL_API=1 e credenciais de teste em REAL_API_EMAIL/REAL_API_PASSWORD.',
);

async function signIn(page) {
  await page.goto('/#/login');
  await page.getByLabel('E-mail').fill(process.env.REAL_API_EMAIL);
  await page.getByLabel('Senha').fill(process.env.REAL_API_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
}

test('consulta a API real pelo navegador e confere os contratos disponíveis', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await signIn(page);
  await expect(page.getByText('Aguardando primeira atualização')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: 'Configurações' })
    .click();
  await expect(page.getByLabel('Intervalo de captura (segundos)')).toBeVisible();
  expect(errors).toEqual([]);
});

test('baixa CSV e PDF reais com tipo e conteúdo básico válidos', async ({ page }) => {
  await signIn(page);
  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: 'Relatórios' })
    .click();
  await expect(page.getByRole('combobox')).toBeEnabled();

  for (const [format, mime] of [
    ['CSV', 'text/csv'],
    ['PDF', 'application/pdf'],
  ]) {
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes(`/dashboard/export/${format.toLowerCase()}?`),
    );
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: `Exportar ${format}` }).click();
    const [response, download] = await Promise.all([responsePromise, downloadPromise]);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']?.split(';')[0]).toBe(mime);
    const bytes = await readFile(await download.path());
    expect(bytes.length).toBeGreaterThan(0);
    if (format === 'CSV') {
      expect(bytes.toString('utf8')).toContain('username,category,total_seconds');
    } else {
      expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    }
  }
});
