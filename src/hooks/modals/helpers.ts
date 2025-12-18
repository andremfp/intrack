import type { ModalState, ModalAction } from "./types";

/**
 * Initial modal state
 */
export const initialModalState: ModalState = {
  type: null,
  editingConsultation: null,
  specialtyYear: null,
};

/**
 * Reducer for modal state management
 */
export function modalsReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_MODAL": {
      const { type, editingConsultation, specialtyYear } = action.payload;
      return {
        type,
        editingConsultation: editingConsultation ?? null,
        specialtyYear: specialtyYear ?? null,
      };
    }

    case "CLOSE_MODAL": {
      return {
        type: null,
        editingConsultation: null,
        specialtyYear: null,
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
