import React, { useState } from 'react';
import './App.css';

function StatCard({ title, mood, value, onInc, onDec, dark, ariaLabel }) {
  return (
    <div className={'stat-card' + (dark ? ' dark' : '')} aria-label={ariaLabel || `${title} ${value}`}>
      <div className="card-title">{title}</div>
      <div className="card-image">{mood}</div>
      <div className="card-footer">
        <button className="btn-small" onClick={onDec} type="button">-</button>
        <div className="value">{value}</div>
        <button className="btn-small" onClick={onInc} type="button">+</button>
      </div>
    </div>
  );
}

function ActionButton({ children, variant = 'blue', ...props }) {
  return (
    <button className={'action-btn ' + variant} type="button" {...props}>
      {children}
    </button>
  );
}

function Modal({ title, message, type, value, onValueChange, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        {type === 'prompt' && (
          <input
            className="modal-input"
            type="number"
            min="0"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        )}
        <div className="modal-actions">
          <button className="modal-btn secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="modal-btn primary" type="button" onClick={onConfirm}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [untappedNoMareo, setUntappedNoMareo] = useState(0);
  const [tappedNoMareo, setTappedNoMareo] = useState(0);
  const [untappedMareado, setUntappedMareado] = useState(0);
  const [tappedMareado, setTappedMareado] = useState(0);
  const [hareCards, setHareCards] = useState(0);
  const [roamingThrone, setRoamingThrone] = useState(0);
  const [exaltedSunborn, setExaltedSunborn] = useState(0);
  const [ojerTaq, setOjerTaq] = useState(0);
  const [undoState, setUndoState] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [modalValue, setModalValue] = useState('');

  const hasNoMareo = untappedNoMareo + tappedNoMareo > 0;
  const hasMareado = untappedMareado + tappedMareado > 0;
  const totalRabbits = untappedNoMareo + tappedNoMareo + untappedMareado + tappedMareado;
  const multiplier = 1 + 2 * (roamingThrone + exaltedSunborn + ojerTaq);
  const duplicateMultiplier = 1 + 2 * (exaltedSunborn + ojerTaq);

  const getSnapshot = () => ({
    untappedNoMareo,
    tappedNoMareo,
    untappedMareado,
    tappedMareado,
    hareCards,
    roamingThrone,
    exaltedSunborn,
    ojerTaq,
  });

  const closeModal = () => {
    setModalState(null);
    setModalValue('');
  };

  const addNoMareo = () => {
    setUndoState(getSnapshot());
    setUntappedNoMareo((value) => value + 1);
  };

  const addMareado = () => {
    setUndoState(getSnapshot());
    setUntappedMareado((value) => value + 1);
  };

  const tapSection = (section) => {
    if (section === 'no-mareo') {
      setUndoState(getSnapshot());
      setUntappedNoMareo((value) => value - 1);
      setTappedNoMareo((value) => value + 1);
      return;
    }

    setUndoState(getSnapshot());
    setUntappedMareado((value) => value - 1);
    setTappedMareado((value) => value + 1);
  };

  const handleCommanderAction = (cost) => {
    const totalUntapped = untappedNoMareo + untappedMareado;
    if (totalUntapped < cost) {
      window.alert('Conejos insuficientes');
      return;
    }

    const snapshot = getSnapshot();
    setUndoState(snapshot);

    let remaining = cost;
    const mareadoToTap = Math.min(untappedMareado, remaining);
    remaining -= mareadoToTap;
    const noMareoToTap = Math.min(untappedNoMareo, remaining);

    setUntappedMareado((value) => Math.max(0, value - mareadoToTap));
    setTappedMareado((value) => value + mareadoToTap);
    setUntappedNoMareo((value) => Math.max(0, value - noMareoToTap));
    setTappedNoMareo((value) => value + noMareoToTap);
  };

  const handleHarePlusOne = () => {
    const snapshot = getSnapshot();
    setUndoState(snapshot);

    const nextCount = hareCards + 1;
    setHareCards(nextCount);

    const tokensToCreate = Math.max(0, nextCount - 1);
    const amountToAdd = tokensToCreate * multiplier;
    if (amountToAdd > 0) {
      setUntappedMareado((value) => value + amountToAdd);
    }
  };

  const handleHareMinusOne = () => {
    const snapshot = getSnapshot();
    setUndoState(snapshot);
    setHareCards((value) => Math.max(0, value - 1));
  };

  const handleBarreConejos = () => {
    setModalState({
      title: 'Confirmar',
      message: '¿Deseas destruir todos los conejos? (Incluye los tokens)',
      type: 'confirm',
      onConfirm: () => {
        setUndoState(getSnapshot());
        setUntappedNoMareo(0);
        setTappedNoMareo(0);
        setUntappedMareado(0);
        setTappedMareado(0);
        setHareCards(0);
        setRoamingThrone(0);
        setExaltedSunborn(0);
        setOjerTaq(0);
        closeModal();
      },
    });
  };

  const handleMultiplierCard = (card, value) => {
    const snapshot = getSnapshot();
    setUndoState(snapshot);

    if (card === 'roaming') {
      setRoamingThrone((current) => Math.max(0, current + value));
      return;
    }

    if (card === 'sunborn') {
      setExaltedSunborn((current) => Math.max(0, current + value));
      return;
    }

    setOjerTaq((current) => Math.max(0, current + value));
  };

  const openMultiplierModal = () => {
    setModalState({
      title: 'Multiplicadores',
      message: 'Ajusta los multiplicadores de creación de tokens.',
      type: 'multipliers',
      onConfirm: () => closeModal(),
    });
  };

  const handleDuplicateTokens = () => {
    setModalState({
      title: 'Confirmar',
      message: '¿Se casteó correctamente esta carta? For each token you control, create a token that’s a copy of that permanent',
      type: 'confirm',
      onConfirm: () => {
        setUndoState(getSnapshot());
        const amountToAdd = totalRabbits * duplicateMultiplier;
        setUntappedMareado((value) => value + amountToAdd);
        closeModal();
      },
    });
  };

  const handleBlink = () => {
    setModalState({
      title: 'Blink',
      message: '¿Cuántas veces se blinkea?',
      type: 'prompt',
      onConfirm: () => {
        const parsedValue = Number(modalValue || 0);
        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
          closeModal();
          return;
        }

        setUndoState(getSnapshot());
        const baseTokens = Math.max(0, hareCards - 1) * hareCards;
        const amountToAdd = baseTokens * parsedValue;
        setUntappedMareado((value) => value + amountToAdd);
        closeModal();
      },
    });
  };

  const handleReturnFromGraveyard = () => {
    setModalState({
      title: 'Regreso del cementerio',
      message: '¿Cuántos conejos regresan al campo de batalla?',
      type: 'prompt',
      onConfirm: () => {
        const parsedValue = Number(modalValue || 0);
        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
          closeModal();
          return;
        }

        setUndoState(getSnapshot());
        const baseTokens = Math.max(0, hareCards - 1) * hareCards;
        const amountToAdd = baseTokens * parsedValue;
        setUntappedMareado((value) => value + amountToAdd);
        closeModal();
      },
    });
  };

  const handleUndo = () => {
    if (!undoState) {
      return;
    }

    setUntappedNoMareo(undoState.untappedNoMareo);
    setTappedNoMareo(undoState.tappedNoMareo);
    setUntappedMareado(undoState.untappedMareado);
    setTappedMareado(undoState.tappedMareado);
    setHareCards(undoState.hareCards);
    setRoamingThrone(undoState.roamingThrone);
    setExaltedSunborn(undoState.exaltedSunborn);
    setOjerTaq(undoState.ojerTaq);
    setUndoState(null);
  };

  const handleNextTurn = () => {
    const snapshot = getSnapshot();
    setUndoState(snapshot);
    setUntappedNoMareo(untappedNoMareo + tappedNoMareo + untappedMareado + tappedMareado);
    setTappedNoMareo(0);
    setUntappedMareado(0);
    setTappedMareado(0);
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="top-left">
          <button className="nav-btn" type="button" onClick={handleUndo} disabled={!undoState}>
            Undo
          </button>
        </div>
        <div className="logo">Conejos</div>
        <div className="top-right">
          <button className="nav-btn" type="button" onClick={handleNextTurn}>
            Siguiente turno
          </button>
        </div>
      </header>

      <main className="content">

        {hasNoMareo && (
          <section className="section-block">
            <h3 className="section-title">Sin mareo:</h3>
            <div className="row">
              <StatCard
                title="Untapeados"
                mood={<img src="/CruzAzul/UntappedNoMareo.png" alt="Untapped No Mareo" className="mood-image" />}
                value={untappedNoMareo}
                onInc={() => setUntappedNoMareo((value) => value + 1)}
                onDec={() => setUntappedNoMareo((value) => Math.max(0, value - 1))}
                ariaLabel={`Untapeados ${untappedNoMareo}`}
              />

              <button
                className="tap-button"
                type="button"
                onClick={() => tapSection('no-mareo')}
                disabled={untappedNoMareo === 0}
                aria-label="girar sin mareo"
              >
                ↺
              </button>

              <StatCard
                title="Tapeados"
                mood={<img src="/CruzAzul/TappedNoMareo.png" alt="Tapped No Mareo" className="mood-image" />}
                value={tappedNoMareo}
                onInc={() => setTappedNoMareo((value) => value + 1)}
                onDec={() => setTappedNoMareo((value) => Math.max(0, value - 1))}
                ariaLabel={`Tapeados ${tappedNoMareo}`}
              />
            </div>
          </section>
        )}

        {hasMareado && (
          <section className="section-block">
            <h3 className="section-title">Mareados:</h3>
            <div className="row">
              <StatCard
                title="Untapeados"
                mood={<img src="/CruzAzul/UntappedMareado.png" alt="Untapped Mareado" className="mood-image" />}
                value={untappedMareado}
                onInc={() => setUntappedMareado((value) => value + 1)}
                onDec={() => setUntappedMareado((value) => Math.max(0, value - 1))}
                dark
                ariaLabel={`Untapeados ${untappedMareado}`}
              />

              <button
                className="tap-button"
                type="button"
                onClick={() => tapSection('mareado')}
                disabled={untappedMareado === 0}
                aria-label="girar mareados"
              >
                ↺
              </button>

              <StatCard
                title="Tapeados"
                mood={<img src="/CruzAzul/TappedMareado.png" alt="Tapped Mareado" className="mood-image" />}
                value={tappedMareado}
                onInc={() => setTappedMareado((value) => value + 1)}
                onDec={() => setTappedMareado((value) => Math.max(0, value - 1))}
                dark
                ariaLabel={`Tapeados ${tappedMareado}`}
              />
            </div>
          </section>
        )}

        <div className="actions-grid">
          <div className="action-btn blue fake-button" aria-label="conejo">
            <img src="/CruzAzul/baylen-the-haymaker.webp" alt="Baylen the Haymaker" className="button-icon" />
          </div>
          <ActionButton onClick={() => handleCommanderAction(2)}>Añadir un mana</ActionButton>
          <ActionButton onClick={() => handleCommanderAction(3)}>Robar una carta</ActionButton>
          <ActionButton onClick={() => handleCommanderAction(4)}>Tres (+1/+1) Trample</ActionButton>

          <div className="action-btn blue fake-button hare-button" aria-label={`Cartas Hare: ${hareCards}`}>
            <img src="/CruzAzul/Hare-apparent.png" alt="Hare apparent" className="button-icon" />
            <span className="hare-counter">{hareCards}</span>
          </div>
          <ActionButton variant="red" onClick={handleHarePlusOne}>Hare +1</ActionButton>
          <ActionButton variant="red" onClick={handleHareMinusOne}>Hare -1</ActionButton>
          <ActionButton variant="red" onClick={handleBarreConejos}>Barre Conejos</ActionButton>

          <ActionButton onClick={openMultiplierModal}>X Tokens</ActionButton>
          <ActionButton onClick={handleDuplicateTokens}>Duplicar Tokens</ActionButton>
          <ActionButton onClick={handleBlink}>Blink</ActionButton>
          <ActionButton onClick={handleReturnFromGraveyard}>Regresar</ActionButton>
        </div>

        <div className="button-row">
          <div className="add-actions">
          <ActionButton onClick={addNoMareo}>Agregar sin mareo</ActionButton>
          <ActionButton onClick={addMareado}>Agregar mareados</ActionButton>
        </div>

        <section className="summary-card" aria-label="Resumen de estado">
          <div>Enderezados sin mareo: {untappedNoMareo}</div>
          <div>Girados sin mareo: {tappedNoMareo}</div>
          <div>Enderezados mareados: {untappedMareado}</div>
          <div>Girados mareados: {tappedMareado}</div>
          <div>Cartas Hare: {hareCards}</div>
          <div>Multiplicador: {multiplier}</div>
        </section>
        </div>



        {modalState && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3 className="modal-title">{modalState.title}</h3>
              <p className="modal-message">{modalState.message}</p>

              {modalState.type === 'multipliers' && (
                <div className="multiplier-list">
                  <div className="multiplier-row">
                    <span>Roaming Throne</span>
                    <div className="multiplier-actions">
                      <button type="button" className="modal-btn secondary" onClick={() => handleMultiplierCard('roaming', -1)}>
                        -
                      </button>
                      <span>{roamingThrone}</span>
                      <button type="button" className="modal-btn primary" onClick={() => handleMultiplierCard('roaming', 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="multiplier-row">
                    <span>Exalted Sunborn</span>
                    <div className="multiplier-actions">
                      <button type="button" className="modal-btn secondary" onClick={() => handleMultiplierCard('sunborn', -1)}>
                        -
                      </button>
                      <span>{exaltedSunborn}</span>
                      <button type="button" className="modal-btn primary" onClick={() => handleMultiplierCard('sunborn', 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="multiplier-row">
                    <span>Ojer Taq</span>
                    <div className="multiplier-actions">
                      <button type="button" className="modal-btn secondary" onClick={() => handleMultiplierCard('ojer', -1)}>
                        -
                      </button>
                      <span>{ojerTaq}</span>
                      <button type="button" className="modal-btn primary" onClick={() => handleMultiplierCard('ojer', 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalState.type === 'prompt' && (
                <input
                  className="modal-input"
                  type="number"
                  min="0"
                  value={modalValue}
                  onChange={(event) => setModalValue(event.target.value)}
                />
              )}

              <div className="modal-actions">
                <button className="modal-btn secondary" type="button" onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  className="modal-btn primary"
                  type="button"
                  onClick={() => {
                    if (modalState.type === 'confirm' || modalState.type === 'multipliers') {
                      modalState.onConfirm();
                      return;
                    }

                    modalState.onConfirm();
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
