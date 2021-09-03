import { BundleState, BundleAction, BundleActionTypes } from '../types/bundle';

const defaultState: BundleState = {
    bundles: [],
    loading: false,
    error: null,
};

const bundleReducer = (state = defaultState, action: BundleAction): BundleState => {
    switch (action.type) {
    case BundleActionTypes.FETCH_BUNDLES_REQUEST:
        return { ...state, loading: true };
    case BundleActionTypes.FETCH_BUNDLES_SUCCESS:
        return { ...state, bundles: action.payload, loading: false, error: null };
    case BundleActionTypes.FETCH_BUNDLES_ERROR:
        return { ...state, error: action.payload, loading: false };
    case BundleActionTypes.ADD_BUNDLE_REQUEST:
            return { ...state, loading: true };
    case BundleActionTypes.ADD_BUNDLE_SUCCESS:
        return { ...state, bundles: [...state.bundles, action.payload], loading: false, error: null };
    case BundleActionTypes.ADD_BUNDLE_ERROR:
        return { ...state, error: action.payload, loading: false };
    case BundleActionTypes.DELETE_BUNDLE: {
        const bundles = state.bundles.filter(bundle => bundle.app_name !== action.payload);
        return { ...state, bundles, loading: false, error: null };
    }
    default:
        return state;
    }
};

export default bundleReducer;
