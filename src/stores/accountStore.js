import { defineStore } from 'pinia';
import {
  listAccount,
  deleteAccount,
  updateAccount,
  addAccount,
} from '@/services/accountService';

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    accounts: [],
    filters: {
      role: null,
      department: null,
      status: null,
    },
    totalElements: 1,
    currentPage: 1, // Current page
    selectedAccount: null,
  }),

  actions: {
    async list(page = 1, size = 10, filter = this.filters) {
      try {
        // Prepare the parameters
        const params = { ...filter, page, size };

        const response = await listAccount(params);

        this.accounts = response.data.data.data; // Assuming response structure matches
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
        console.log(defineStore);
      } catch (error) {
        console.error('Failed to list accounts:', error);
      }
    },

    // Delete a account by ID
    async deleteAcc(id) {
      try {
        await deleteAccount(id);
        this.list(this.currentPage);
        console.log(`Deleted account with ID ${id}.`);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    },

    // Update account details
    async update(accountId, accountData) {
      await updateAccount(accountId, accountData);
      this.list(this.currentPage);
      this.selectedAccount = null;
    },
    // Add a new account
    async add(accountData) {
      await addAccount(accountData);
      this.list(this.currentPage);
    },

    // Set selected account
    setSelectedAccount(account) {
      this.selectedAccount = account;
      console.log(account)
    },

    // Clear selected account
    clearSelectedAccount() {
      this.selectedAccount = null;
    },
  },
});
