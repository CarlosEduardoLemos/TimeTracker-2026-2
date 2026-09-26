import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('http://localhost:8000/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/dashboard/summary') {
      return route.fulfill({ json: { date: url.searchParams.get('date'), users: [] } });
    }
    if (url.pathname === '/config/') {
      return route.fulfill({ json: { capture_interval_seconds: 10, idle_timeout_seconds: 300 } });
    }
    return route.fulfill({ json: [] });
  });
});

for (const route of ['painel', 'colaboradores', 'relatorios', 'configuracoes']) {
  test(`sem violações WCAG detectadas em ${route}`, async ({ page }) => {
    await page.goto(`/#/${route}`);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
      })),
    ).toEqual([]);
  });
}

test('foco do menu e conteúdo continuam acessíveis no mobile escuro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/painel');
  await page.getByRole('button', { name: 'Tema escuro' }).click();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })),
  ).toEqual([]);
});
