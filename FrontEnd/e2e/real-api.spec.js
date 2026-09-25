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
