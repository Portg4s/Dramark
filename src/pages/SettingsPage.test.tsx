import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkForPwaUpdates: vi.fn(),
  downloadTextFile: vi.fn(),
  exportLibraryData: vi.fn(),
  importLibraryData: vi.fn()
}));

vi.mock('@/app/pwaRegistration', () => ({
  checkForPwaUpdates: mocks.checkForPwaUpdates
}));

vi.mock('@/features/settings/downloadTextFile', () => ({
  createDatedExportFileName: () => 'dramark-export-2026-08-28.json',
  downloadTextFile: mocks.downloadTextFile
}));

vi.mock('@/features/settings/importExport', () => ({
  exportLibraryData: mocks.exportLibraryData,
  importLibraryData: mocks.importLibraryData
}));

describe('SettingsPage', () => {
  let SettingsPage: ComponentType;

  afterEach(() => {
    cleanup();
  });

  beforeEach(async () => {
    vi.resetModules();
    mocks.checkForPwaUpdates.mockReset();
    mocks.downloadTextFile.mockReset();
    mocks.exportLibraryData.mockReset();
    mocks.importLibraryData.mockReset();
    SettingsPage = (await import('@/pages/SettingsPage')).SettingsPage;
  });

  it('exports the local library as a Dramark JSON file', async () => {
    const user = userEvent.setup();
    mocks.exportLibraryData.mockResolvedValue('{"version":1}');

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /Exporter mes/ }));

    await waitFor(() => {
      expect(mocks.downloadTextFile).toHaveBeenCalledWith({
        content: '{"version":1}',
        fileName: 'dramark-export-2026-08-28.json',
        mimeType: 'application/json'
      });
    });
    expect(screen.getByText('Export prêt.')).toBeInTheDocument();
  });

  it('imports a Dramark JSON file without clearing existing data', async () => {
    const user = userEvent.setup();
    mocks.importLibraryData.mockResolvedValue({ importedCount: 1, skippedCount: 1 });
    const file = new File(['{"version":1}'], 'dramark.json', { type: 'application/json' });

    render(<SettingsPage />);

    await user.upload(screen.getByLabelText('Choisir un fichier Dramark'), file);

    await waitFor(() => {
      expect(mocks.importLibraryData).toHaveBeenCalledWith('{"version":1}');
    });
    expect(screen.getByText('1 contenu importé, 1 déjà présent.')).toBeInTheDocument();
  });

  it('checks for PWA updates from settings', async () => {
    const user = userEvent.setup();
    mocks.checkForPwaUpdates.mockResolvedValue(true);

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /Vérifier les mises à jour/ }));

    await waitFor(() => {
      expect(mocks.checkForPwaUpdates).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Recherche de mise à jour terminée.')).toBeInTheDocument();
  });

  it('shows the app version and JustWatch attribution', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Version 0.2.1')).toBeInTheDocument();
    expect(screen.getAllByText(/JustWatch/)).toHaveLength(2);
  });
});
