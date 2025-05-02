import React, { useEffect, useState } from "react";
import "../css/ModificationHistory.css";

const ModificationHistory = ({ projectId }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al cargar el historial");
        }
        const data = await response.json();
        console.log("Historial recibido:", data.modificationHistory);
        setHistory(data.modificationHistory || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <span>
        {formattedDate}, <strong>{formattedTime}</strong>
        {/* Time */}
      </span>
    );
  };

  const getRequirementTypeSingular = (type) => {
    const types = {
      EP: "Épica",
      RF: "Requerimiento Funcional",
      RNF: "Requerimiento No Funcional",
      HU: "Historia de Usuario",
    };
    return types[type] || type;
  };

  const renderChangeList = (changes) => {
    const items = [];
    Object.entries(changes).forEach(([key, value]) => {
      if (Array.isArray(value) && ["EP", "RF", "RNF", "HU"].includes(key)) {
        value.forEach((change) => {
          const id = change.id;
          if (change.changes.nuevo) {
            items.push(
              <li key={key + id + "nuevo"}>
                Se agregó {getRequirementTypeSingular(key)} con ID <b>{id}</b>
              </li>
            );
          } else if (change.changes.eliminado) {
            items.push(
              <li key={key + id + "eliminado"}>
                Se eliminó {getRequirementTypeSingular(key)} con ID <b>{id}</b>
              </li>
            );
          } else {
            Object.entries(change.changes).forEach(([field, vals]) => {
              const fieldLabel =
                field === "data"
                  ? "descripción"
                  : field === "titulo"
                  ? "título"
                  : field;
              items.push(
                <li key={key + id + field}>
                  En {getRequirementTypeSingular(key)} <b>{id}</b>, se cambió{" "}
                  <b>{fieldLabel}</b> de "{vals.oldValue}" a "{vals.newValue}"
                </li>
              );
            });
          }
        });
      } else {
        switch (key) {
          case "nombreProyecto":
            items.push(
              <li key={key}>
                Se cambió el nombre del proyecto de "{value.oldValue}" a "
                {value.newValue}"
              </li>
            );
            break;
          case "descripcion":
            items.push(
              <li key={key}>Se modificó la descripción del proyecto</li>
            );
            break;
          case "EP":
          case "RF":
          case "RNF":
          case "HU":
            items.push(
              <li key={key}>Se modificaron los {getRequirementType(key)}</li>
            );
            break;
          default:
            items.push(<li key={key}>Se modificó {key}</li>);
        }
      }
    });
    return <ul className="change-list">{items}</ul>;
  };

  const getRequirementType = (type) => {
    const types = {
      EP: "Épicas",
      RF: "Requerimientos Funcionales",
      RNF: "Requerimientos No Funcionales",
      HU: "Historias de Usuario",
    };
    return types[type] || type;
  };

  if (loading) {
    return <div className="modification-history">Cargando historial...</div>;
  }

  if (error) {
    return <div className="modification-history error">Error: {error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="modification-history">
        No hay modificaciones registradas
      </div>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="modification-history">
      <h3>Historial de Modificaciones</h3>
      <div className="history-list">
        {sortedHistory.map((item, index) => (
          <div key={index} className="history-item">
            <div className="history-item-header">
              <span className="history-type">Modificación</span>
              <span className="history-date">{formatDate(item.timestamp)}</span>
            </div>
            {renderChangeList(item.changes)}
            <div className="history-user">
              <span className="user-label">Usuario:</span>
              <span className="user-name">
                {item.userName
                  ? `${item.userName} ${item.userLastname || ""}`.trim()
                  : item.userId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModificationHistory;
