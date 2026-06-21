import { combineReducers } from 'redux';
import userReducer from './users/reducer';
import queueReducer from './queue/queueSlice';

export const rootReducer = combineReducers({
  users: userReducer,
  queue: queueReducer,
});
