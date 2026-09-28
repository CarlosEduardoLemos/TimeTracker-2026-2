import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.skip(!process.env.RUN_REAL_API, 'Requer FastAPI em execução e RUN_REAL_API=1.');

test('consulta a API real pelo navegador e confere os contratos disponíveis', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#/painel');
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
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
  await page.goto('/#/relatorios');
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
