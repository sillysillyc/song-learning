// import { message } from 'antd';
// import { createAsyncThunk } from '@reduxjs/toolkit';
// import { fetchCount } from '@/helpers/fetch-interfaces/count';
// import { incrementByAmount } from './index';

// export const incrementAsync = createAsyncThunk('global/incrementAsync', async (amount: number, { dispatch }) => {
//   try {
//     const response = await fetchCount(amount);
//     dispatch(incrementByAmount(response.data));
//     return;
//   } catch (error) {
//     return Promise.reject(error);
//   }
// });

// export const incrementAsync2 = createAsyncThunk('global/incrementAsync2', async (amount: number, { dispatch }) => {
//   try {
//     const response = await fetchCount(amount);
//     dispatch(incrementByAmount(response.data));
//     throw new Error('f');
//     // The value we return becomes the `fulfilled` action payload
//     // return response.data;
//   } catch (error) {
//     message.error(error.message);
//     return Promise.reject(error);
//   }
// });

// const asyncThunks = [incrementAsync, incrementAsync2];

// export default asyncThunks;

export {};
