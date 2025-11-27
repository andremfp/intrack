import type { ModalState, ModalAction } from "./types";

/**
 * Initial modal state
 */
export const initialModalState: ModalState = {
  type: null,
  editingConsultation: null,
};

/**
 * Reducer for modal state management
 */
export function modalsReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_MODAL": {
      const { type, editingConsultation } = action.payload;
      return {
        type,
        editingConsultation: editingConsultation ?? null,
      };
    }

    case "CLOSE_MODAL": {
      return {
        type: null,
        editingConsultation: null,
      };
    }

    case "SET_EDITING_CONSULTATION": {
      return {
        ...state,
        editingConsultation: action.payload,
      };
    }

    case "RESET": {
      return initialModalState;
    }

    default: {
      // Exhaustiveness check
      void action;
      return state;
    }
  }
}
