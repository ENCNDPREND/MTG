import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('rabbit battle counters', () => {
  test('hides empty sections while keeping the app ready to add rabbits', () => {
    render(<App />);

    expect(screen.queryByText('Sin mareo:')).not.toBeInTheDocument();
    expect(screen.queryByText('Mareados:')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar sin mareo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar mareados/i })).toBeInTheDocument();
  });

  test('moves a rabbit from untapped to tapped within the same section', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /agregar sin mareo/i }));

    expect(screen.getByText('Sin mareo:')).toBeInTheDocument();
    expect(screen.getByLabelText('Untapeados 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /girar sin mareo/i }));

    expect(screen.getByLabelText('Untapeados 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Tapeados 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /girar sin mareo/i })).toBeDisabled();
  });

  test('shows the insufficient-rabbits alert for commander actions', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /añadir un mana/i }));

    expect(alertSpy).toHaveBeenCalledWith('Conejos insuficientes');
    alertSpy.mockRestore();
  });

  test('adds hare cards and creates tokens in the mareado untapped section', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /hare \+1/i }));

    expect(screen.getAllByText(/Cartas Hare: 1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Enderezados mareados: 0/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /hare \+1/i }));

    expect(screen.getAllByText(/Cartas Hare: 2/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Enderezados mareados: 1/i)).toBeInTheDocument();
  });
});
