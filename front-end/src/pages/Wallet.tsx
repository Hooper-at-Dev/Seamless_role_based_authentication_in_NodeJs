import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, CreditCard, History, QrCode, TrendingUp, Bell, Car, Map, Filter, Star, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import QRCode from 'react-qr-code';
import { useAuth } from '../utils/AuthContext';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    description: 'Wallet Recharge',
    timestamp: '2024-03-15 14:30',
  },
  {
    id: '2',
    type: 'debit',
    amount: 50,
    description: 'Campus Bus Fare',
    timestamp: '2024-03-15 16:45',
  },
];

const PAYPAL_CLIENT_ID = "AdZQr6dtL7bfSkMWwlpjLOVRKeHlkMtx9vOr0_L1Tb2yU95HTVl-MyGCyPBzK-PHE9ECqx6xC7WG9T3N";

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [travelPoints, setTravelPoints] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'qr' | null>(null);
  const [qrValue, setQrValue] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');

  useEffect(() => {
    // Get credits from the authenticated user
    if (user && user.credits !== undefined) {
      setBalance(user.credits);
    }
  }, [user]);

  const handlePaypalSuccess = (details: any) => {
    const amount = Number(rechargeAmount);
    setBalance((prev) => prev + amount);
    setShowRechargeModal(false);
    setRechargeAmount('');
    setPaymentMethod(null);
    alert('Payment successful! Wallet recharged.');
  };

  const handlePaypalError = (err: any) => {
    console.error('PayPal Error:', err);
    alert('PayPal payment failed. Please try again. Check console for details.');
  };

  const handleQrPayment = () => {
    const amount = Number(rechargeAmount);
    if (amount > 0) {
      setBalance((prev) => prev + amount);
      setShowRechargeModal(false);
      setRechargeAmount('');
      setPaymentMethod(null);
      alert('QR Payment simulated successfully!');
    }
  };

  const generateQrCode = () => {
    const qrData = `upi://pay?pa=9264423677@ptsbi&pn=CampusWallet&am=${rechargeAmount}&cu=INR`;
    setQrValue(qrData);
    setPaymentMethod('qr');
  };

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">CyberCab</h1>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">Welcome, [xAI]!</p>
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Wallet and Points Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Wallet Balance</h2>
              <WalletIcon className="text-blue-600 w-8 h-8" />
            </div>
            <p className="text-4xl font-bold text-blue-600">{balance.toFixed(2)}</p>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recharge Wallet
            </button>
          </div>

          {/* Travel Points Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Travel Points</h2>
              <TrendingUp className="text-green-600 w-8 h-8" />
            </div>
            <p className="text-4xl font-bold text-green-600">{travelPoints}</p>
            <p className="mt-2 text-gray-600">Points can be used for campus travel</p>
          </div>

          {/* Promotional Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Earn More Points!</h2>
              <Star className="w-8 h-8" />
            </div>
            <p className="text-sm">Refer a friend and earn 50 travel points for each signup!</p>
            <button className="mt-4 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Invite Now
            </button>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-white rounded-xl shadow-lg p-4 hover:bg-gray-50 transition-colors">
              <Car className="w-6 h-6 text-blue-600" />
              <span className="text-gray-800 font-semibold">Book a Ride</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white rounded-xl shadow-lg p-4 hover:bg-gray-50 transition-colors">
              <Map className="w-6 h-6 text-blue-600" />
              <span className="text-gray-800 font-semibold">View Trip History</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white rounded-xl shadow-lg p-4 hover:bg-gray-50 transition-colors">
              <WalletIcon className="w-6 h-6 text-blue-600" />
              <span className="text-gray-800 font-semibold">Manage Wallet</span>
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-6 h-6 text-gray-600" />
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="border rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.timestamp}</p>
                </div>
                <p
                  className={`font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                </p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Load More
          </button>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Recharge Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ()
                </label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="1"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 px-4 py-2 rounded-lg mr-2 ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <CreditCard className="w-5 h-5 inline mr-2" /> PayPal
                  </button>
                  <button
                    onClick={generateQrCode}
                    className={`flex-1 px-4 py-2 rounded-lg ml-2 ${
                      paymentMethod === 'qr'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <QrCode className="w-5 h-5 inline mr-2" /> QR Code
                  </button>
                </div>

                {paymentMethod === 'paypal' && rechargeAmount && (
                  <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", environment: "sandbox" }}>
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: (Number(rechargeAmount) / 83).toFixed(2),
                                currency_code: 'USD',
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(handlePaypalSuccess);
                      }}
                      onError={handlePaypalError}
                    />
                  </PayPalScriptProvider>
                )}

                {paymentMethod === 'qr' && qrValue && (
                  <div className="text-center">
                    <QRCode value={qrValue} size={200} />
                    <p className="mt-2 text-sm text-gray-600">
                      Scan this QR code with your UPI app
                    </p>
                    <button
                      onClick={handleQrPayment}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm QR Payment
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowRechargeModal(false);
                    setPaymentMethod(null);
                    setRechargeAmount('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {!paymentMethod && (
                  <button
                    disabled={!rechargeAmount || Number(rechargeAmount) <= 0}
                    onClick={() => {}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Proceed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}