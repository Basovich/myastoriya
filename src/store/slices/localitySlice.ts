import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Locality } from '@/lib/graphql';

interface LocalityState {
    selectedCity: Locality | null;
    isPromptVisible: boolean;
    isDetectionLoading: boolean;
    isManualSelectionOpen: boolean;
    isPromptInteractionDone: boolean;
}

const initialState: LocalityState = {
    selectedCity: null,
    isPromptVisible: false,
    isDetectionLoading: false,
    isManualSelectionOpen: false,
    isPromptInteractionDone: false,
};

const localitySlice = createSlice({
    name: 'locality',
    initialState,
    reducers: {
        setSelectedCity: (state, action: PayloadAction<Locality | null>) => {
            state.selectedCity = action.payload;
        },
        setPromptVisible: (state, action: PayloadAction<boolean>) => {
            state.isPromptVisible = action.payload;
        },
        setDetectionLoading: (state, action: PayloadAction<boolean>) => {
            state.isDetectionLoading = action.payload;
        },
        setManualSelectionOpen: (state, action: PayloadAction<boolean>) => {
            state.isManualSelectionOpen = action.payload;
        },
        setPromptInteractionDone: (state, action: PayloadAction<boolean>) => {
            state.isPromptInteractionDone = action.payload;
        },
    },
});

export const {
    setSelectedCity,
    setPromptVisible,
    setDetectionLoading,
    setManualSelectionOpen,
    setPromptInteractionDone,
} = localitySlice.actions;

export default localitySlice.reducer;
