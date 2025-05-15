// import { describe, it, expect, jest } from '@jest/globals';
// import { transferTX } from '../src/lib/transferTX';

// jest.mock('tonweb', () => {
//   const mockSend = jest.fn().mockResolvedValue('mocked_tx_hash');
//   const mockSeqno = jest.fn().mockResolvedValue(1);
//   const mockTransfer = jest.fn(() => ({ send: mockSend }));
//   const mockCreateTransferBody = jest.fn().mockResolvedValue('payload');
//   const JettonWallet = jest.fn(() => ({ createTransferBody: mockCreateTransferBody }));
//   return {
//     __esModule: true,
//     default: jest.fn(() => ({
//       provider: {},
//       wallet: {
//         create: jest.fn(),
//         all: {
//           v3R2: jest.fn(() => ({
//             methods: {
//               seqno: jest.fn(() => ({ call: mockSeqno })),
//               transfer: mockTransfer,
//             },
//           })),
//         },
//       },
//       token: {
//         jetton: { JettonWallet },
//       },
//       utils: {
//         Address: jest.fn(addr => addr),
//         toNano: jest.fn(val => val),
//         stringToBytes: jest.fn(str => str),
//       },
//     })),
//   };
// });

// describe('transferTX', () => {
//   it('успешно отправляет TON', async () => {
//     const res = await transferTX({
//       to: 'address',
//       amount: '1',
//       secretKey: new Uint8Array(64),
//       walletAddress: 'wallet',
//       token: 'TON',
//     });
//     expect(res.txHash).toBe('mocked_tx_hash');
//   });

//   it('выбрасывает ошибку при некорректных параметрах', async () => {
//     await expect(transferTX({
//       to: '',
//       amount: '',
//       secretKey: new Uint8Array(64),
//       walletAddress: '',
//       token: 'TON',
//     })).rejects.toThrow('Некорректные параметры');
//   });

//   it('выбрасывает ошибку если не передан jettonAddress для TIP-3', async () => {
//     await expect(transferTX({
//       to: 'address',
//       amount: '1',
//       secretKey: new Uint8Array(64),
//       walletAddress: 'wallet',
//       token: 'TIP3',
//     })).rejects.toThrow('jettonAddress required for jetton transfer');
//   });
// }); 