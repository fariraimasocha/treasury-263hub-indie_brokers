"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import CircularSpinner from "@/components/Loading";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Building, BadgeDollarSign, CircleDollarSign } from "lucide-react";

export default function Dashboard() {
  // Fetch budget data
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budget");
      const data = await response.json();
      return data.budgets;
    },
  });

  // Fetch departments data
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fetch("/api/department");
      const data = await response.json();
      return data.departments;
    },
  });

  // Prepare chart data based on budgets by quarter
  const chartData = React.useMemo(() => {
    if (!budgets) return [];

    // Group budgets by quarter and calculate totals
    const quarterData = {};

    budgets.forEach((budget) => {
      const key = `Q${budget.quater}-${budget.year}`;
      if (!quarterData[key]) {
        quarterData[key] = {
          name: key,
          totalBudget: 0,
          remainingBudget: 0,
        };
      }
      quarterData[key].totalBudget += budget.budget;
      quarterData[key].remainingBudget += budget.remainingAmount || 0;
    });

    // Convert to array and sort by quarter/year
    return Object.values(quarterData).sort((a, b) => {
      const [aQ, aYear] = a.name.split("-");
      const [bQ, bYear] = b.name.split("-");

      if (aYear !== bYear) return aYear - bYear;
      return aQ.localeCompare(bQ);
    });
  }, [budgets]);

  // Calculate summary metrics
  const totalBudget =
    budgets?.reduce((sum, budget) => sum + budget.budget, 0) || 0;
  const totalDepartments = departments?.length || 0;
  const totalSpent =
    budgets?.reduce(
      (sum, budget) => sum + (budget.budget - (budget.remainingAmount || 0)),
      0
    ) || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (budgetsLoading || departmentsLoading) {
    return <CircularSpinner size="small" color="text-gray-900" />;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Budget Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">
                {formatCurrency(totalBudget)}
              </div>
              <BadgeDollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-2 px-4">
            <p className="text-xs text-muted-foreground">
              All approved budgets
            </p>
          </CardFooter>
        </Card>

        {/* Total Departments Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">{totalDepartments}</div>
              <Building className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-2 px-4">
            <p className="text-xs text-muted-foreground">
              Total registered departments
            </p>
          </CardFooter>
        </Card>

        {/* Total Spent Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <CircleDollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-2 px-4">
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Line Graph */}
      <Card className="col-span-4 mt-4">
        <CardHeader>
          <CardTitle>Budget Allocation Over Time</CardTitle>
          <CardDescription>
            Quarterly budget allocation and remaining amounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                      style: "currency",
                      currency: "USD",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), ""]}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalBudget"
                  name="Total Budget"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="remainingBudget"
                  name="Remaining Budget"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
