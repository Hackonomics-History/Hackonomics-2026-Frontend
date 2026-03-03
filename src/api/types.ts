export interface UserInfo {
    id: number;
    email: string;
}

// meta/countries
export interface Country {
    code: string;
    name: string;
    currencies: string[];
    default_currency: string;
    flag?: string;
}

export interface ExchangeRate {
    base: string;
    target: string;
    rate: number;
}

// accounts/me
export interface AccountApiResponse {
    country_code: string;
    currency: string;
    annual_income: string;
    monthly_investable_amount: string;
}

//accounts/me/exchange-rate
export interface MyExchangeRateApiResponse {
    base: string;
    target: string;
    rate: number;
    last_updated?: string;
}

//common/errors
export type ErrorAction =
    | "SHOW_ALERT"
    | "LOGOUT"
    | "REDIRECT_LOGIN"
    | "RETRY"
    | "IGNORE";

// calendar
export interface CalendarEvent {
    id: string;
    title: string;
    start_at: string;
    end_at: string;
    estimated_cost?: number | null;
    color?: string;
    category_ids: string[];
}

// news
export type NewsItem = {
    title: string;
    description: string;
};

export type BusinessNewsResponse = {
    country_code?: string;
    country_name?: string;
    news: NewsItem[];
    last_updated: string | null;
    next_update: string | null;
    update_interval_hours: number;
};

export type RefreshResponse = {
    status: "queued";
    country_code: string;
    task_id: string;
};