import { useState, useCallback } from "react";
import {
  DashboardConfig,
  DashboardRegistry,
  GlobalFilters,
  JsonPatch,
  WidgetConfig,
} from "@/types/dashboard";

const initialState: DashboardRegistry = {
  activeDashboard: null,
  history: [],
  filters: {},
};

export function useDashboardRegistry() {
  const [registry, setRegistry] = useState<DashboardRegistry>(initialState);

  // Criar novo dashboard
  const createDashboard = useCallback((dashboard: DashboardConfig) => {
    setRegistry((prev) => ({
      ...prev,
      activeDashboard: dashboard,
      history: prev.activeDashboard
        ? [...prev.history, prev.activeDashboard]
        : prev.history,
    }));
  }, []);

  // Aplicar patch incremental ao dashboard ativo
  const applyPatch = useCallback((patches: JsonPatch[]) => {
    setRegistry((prev) => {
      if (!prev.activeDashboard) return prev;

      let dashboard = JSON.parse(JSON.stringify(prev.activeDashboard));

      try {
        for (const patch of patches) {
          if (!patch.path) continue;
          const pathParts = patch.path.split("/").filter(Boolean);

          // Workaround for LLM hallucinations adding "/dashboard" prefix to patch paths
          if (
            pathParts.length > 0 &&
            pathParts[0].toLowerCase() === "dashboard"
          ) {
            pathParts.shift();
          }

          if (patch.op === "add" || patch.op === "replace") {
            dashboard = applyPathValue(dashboard, pathParts, patch.value);
          } else if (patch.op === "remove") {
            dashboard = removePathValue(dashboard, pathParts);
          }
        }
      } catch (err) {
        console.error("Failed to apply patch:", err);
      }

      return { ...prev, activeDashboard: dashboard };
    });
  }, []);

  // Atualizar widget específico
  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      setRegistry((prev) => {
        if (!prev.activeDashboard) return prev;

        const widgets = prev.activeDashboard.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w,
        );

        return {
          ...prev,
          activeDashboard: { ...prev.activeDashboard, widgets },
        };
      });
    },
    [],
  );

  // Adicionar widget ao dashboard ativo
  const addWidget = useCallback((widget: WidgetConfig) => {
    setRegistry((prev) => {
      if (!prev.activeDashboard) return prev;

      return {
        ...prev,
        activeDashboard: {
          ...prev.activeDashboard,
          widgets: [...prev.activeDashboard.widgets, widget],
        },
      };
    });
  }, []);

  // Remover widget
  const removeWidget = useCallback((widgetId: string) => {
    setRegistry((prev) => {
      if (!prev.activeDashboard) return prev;

      return {
        ...prev,
        activeDashboard: {
          ...prev.activeDashboard,
          widgets: prev.activeDashboard.widgets.filter(
            (w) => w.id !== widgetId,
          ),
        },
      };
    });
  }, []);

  // Limpar dashboard ativo
  const clearDashboard = useCallback(() => {
    setRegistry((prev) => ({
      ...prev,
      activeDashboard: null,
    }));
  }, []);

  // Atualizar filtros globais
  const updateFilters = useCallback((filters: Partial<GlobalFilters>) => {
    setRegistry((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      activeDashboard: prev.activeDashboard
        ? {
            ...prev.activeDashboard,
            filters: { ...prev.activeDashboard.filters, ...filters },
          }
        : null,
    }));
  }, []);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setRegistry((prev) => {
      if (!prev.activeDashboard) return prev;

      return {
        ...prev,
        activeDashboard: {
          ...prev.activeDashboard,
          viewMode:
            prev.activeDashboard.viewMode === "executive"
              ? "operational"
              : "executive",
        },
      };
    });
  }, []);

  // Calcular similaridade de eixos (para decidir UPDATE vs CREATE)
  const calculateAxesSimilarity = useCallback(
    (newAxes: DashboardConfig["axes"]) => {
      if (!registry.activeDashboard) return 0;

      const currentAxes = registry.activeDashboard.axes;
      const axisKeys = ["entity", "time", "metric", "region"] as const;

      let matches = 0;
      let total = 0;

      for (const key of axisKeys) {
        if (newAxes[key] || currentAxes[key]) {
          total++;
          if (newAxes[key] === currentAxes[key]) {
            matches++;
          }
        }
      }

      return total > 0 ? matches / total : 0;
    },
    [registry.activeDashboard],
  );

  return {
    registry,
    activeDashboard: registry.activeDashboard,
    filters: registry.filters,
    createDashboard,
    applyPatch,
    updateWidget,
    addWidget,
    removeWidget,
    clearDashboard,
    updateFilters,
    toggleViewMode,
    calculateAxesSimilarity,
  };
}

// Helper para aplicar valor em path aninhado
function applyPathValue(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;

  const [first, ...rest] = path;
  const index = parseInt(first, 10);

  if (!isNaN(index) && Array.isArray(obj)) {
    const newArr = [...obj];
    newArr[index] =
      rest.length === 0 ? value : applyPathValue(newArr[index], rest, value);
    return newArr;
  }

  const safeObj = obj || {};
  return {
    ...safeObj,
    [first]:
      rest.length === 0
        ? value
        : applyPathValue(safeObj[first] || {}, rest, value),
  };
}

// Helper para remover valor em path aninhado
function removePathValue(obj: any, path: string[]): any {
  if (obj === null || obj === undefined) return obj;
  if (path.length === 0) return obj;

  if (path.length === 1) {
    if (Array.isArray(obj)) {
      const index = parseInt(path[0], 10);
      if (!isNaN(index)) {
        const newArr = [...obj];
        newArr.splice(index, 1);
        return newArr;
      }
    }
    const { [path[0]]: _, ...rest } = obj;
    return rest;
  }

  const [first, ...rest] = path;
  if (Array.isArray(obj)) {
    const index = parseInt(first, 10);
    if (!isNaN(index)) {
      const newArr = [...obj];
      newArr[index] = removePathValue(newArr[index], rest);
      return newArr;
    }
  }

  return {
    ...obj,
    [first]: removePathValue(obj[first], rest),
  };
}
