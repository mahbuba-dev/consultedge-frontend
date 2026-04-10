export interface NavItem {
    title : string,
    href : string,
    icon : string,
     children?: NavItem[];
}

export interface NavSection {
    title ?: string,
    items : NavItem[]
}

export interface PieChartData {
    status: string,
    count: number
}

export interface BarChartData {
    month: Date | string,
    count?: number,
    amount?: number
}

