import { combineReducers } from 'redux';
import userReducer from './userReducer/reducer';

export interface RootState {
  userReducer: UserReducerState;
}

const RootReducer = combineReducers({
  userReducer,
});

export default RootReducer;
