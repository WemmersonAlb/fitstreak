import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppDataProvider } from './state/AppDataContext';
import { ToastProvider } from './state/ToastContext';
import { AppRoutes } from './App';
import { MemoryStore, StorageRepository } from './services/storage/repository';
import { STORAGE_KEY } from './constants';
import type { AppData } from './types';

function renderApp(store: MemoryStore, path = '/') {
  const repository = new StorageRepository(store);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AppDataProvider repository={repository}>
          <AppRoutes />
        </AppDataProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const saved = (store: MemoryStore) => JSON.parse(store.getItem(STORAGE_KEY)!) as AppData;

describe('fluxos principais', () => {
  it('registra água, celebra a primeira conquista e persiste após recarregar', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const view = renderApp(store);

    await user.click(screen.getAllByRole('button', { name: 'Adicionar 500 ml de água' })[0]);
    expect(await screen.findByRole('dialog', { name: /Primeiro passo/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Próxima|Bora/ }));

    expect(saved(store).waterEntries).toHaveLength(1);
    expect(saved(store).achievements['streak-1']).toBeDefined();

    view.unmount();
    renderApp(store);
    const card = screen.getByRole('region', { name: 'Hidratação' });
    expect(within(card).getByText('500 ml')).toBeInTheDocument();
    expect(screen.getByText('Hoje já está contando. Bom trabalho! ✅')).toBeInTheDocument();
  });

  it('registra uma refeição com a opção principal', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, settings: { celebrations: false } }));
    renderApp(store);

    await user.click(screen.getAllByRole('button', { name: 'Registrar Lanche' })[0]);
    const dialog = await screen.findByRole('dialog', { name: 'Registrar refeição' });
    await user.click(within(dialog).getByRole('button', { name: /^Registrar$/ }));

    const data = saved(store);
    expect(data.mealLogs).toHaveLength(1);
    expect(data.mealLogs[0].categoryId).toBe('lanche');
    expect(data.mealLogs[0].choices.map((c) => c.food)).toContain('Banana prata');
    expect(screen.getByText(/1 de 5 refeições acompanhadas/)).toBeInTheDocument();
  });

  it('registra refeição livre sem quebrar a ofensiva', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, settings: { celebrations: false } }));
    renderApp(store, '/alimentacao?aba=livres');

    await user.click(screen.getByRole('button', { name: /Registrar refeição livre/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Registrar refeição livre' });
    await user.type(within(dialog).getByLabelText('O que você comeu?'), 'Pizza');
    await user.click(within(dialog).getByRole('button', { name: 'Registrar' }));

    expect(saved(store).freeMeals).toHaveLength(1);
    expect(screen.getByText('1 de 2 planejadas')).toBeInTheDocument();
  });

  it('busca alimento na lista de substituições', async () => {
    const user = userEvent.setup();
    renderApp(new MemoryStore(), '/alimentacao?aba=substituicoes');
    await user.type(screen.getByLabelText(/Buscar alimento/), 'batata inglesa');
    expect(screen.getByText('Batata inglesa cozida')).toBeInTheDocument();
    expect(screen.getByText('Batata inglesa sauté')).toBeInTheDocument();
    expect(screen.getAllByText('Grupo 5').length).toBeGreaterThan(0);
  });
});
