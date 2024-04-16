export interface Lock {
    lockId: number;
    tokenName: string;
    lpAddress: string;
    initialLiquidity: number;
    currentLiquidity: number;
    totalBalance: number;
   }
   
   export interface Deal {
    borrower: string;
    lpToken: string;
    lockIndex: number;
    dealType: number;
    dealAmount: number;
    interestRate: number;
    loanDuration: number;
    startTime: number;
    lender: string;
    isRepaid: boolean;
    isActive: boolean;
   }
   
   export interface Auction {
    owner: string;
    highestBidOwner: string;
    lpToken: string;
    lockIndex: number;
    startPrice: number;
    duration: number;
    startTime: number;
    isActive: boolean;
   }