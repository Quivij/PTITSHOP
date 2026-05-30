import { useEffect, useState } from "react";
import { Product } from "../../../types/Product.ts";
import { Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { get10BestSellerProducts, getNewUsers, getRevenueStats } from "../../../api/adminApis.ts";
import "./DashboardPage.css";
import axiosClient from "../../../api/axiosClient.ts";

interface RevenueStat {
  month: string;
  revenue: number;
  orders: number;
}

interface Summary {
  revenue: string;
  orders: number;
  users: number;
  growth: string;
}

interface RevenueApiResponse {
  date: string;
  revenue: number;
  orders: number;
}

interface NewUserApiResponse {
  date: string,
  users: number
}

const StatCard = ({ icon: Icon, title, value, color, hint }: any) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      <Icon className="icon" />
    </div>
    <div className="stat-info">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-31");
  const [userData, setUserData] = useState<{ date: string; users: number }[]>([]);
  const [chartData, setChartData] = useState<RevenueStat[]>([]);
  const [summary, setSummary] = useState<Summary>({
    revenue: "0 VND",
    orders: 0,
    users: 0,
    growth: "+0%",
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topSoldProducts = await get10BestSellerProducts();
        // get10BestSellerProducts() trả về AxiosResponse<Product[]>
        // nên lấy .data để có Product[]
        setProducts(topSoldProducts);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, usersRes] = await Promise.all([
          getRevenueStats(from, to, "month"),
          getNewUsers(from, to, "month"),
        ]);

        const apiData: RevenueStat[] = revenueRes.map((d: RevenueApiResponse) => {
          const monthIndex = parseInt(d.date.split("-")[1]) - 1;
          const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];
          return {
            month: monthNames[monthIndex],
            revenue: d.revenue,
            orders: d.orders,
          };
        });
        setChartData(apiData);

        const usersApiData: NewUserApiResponse[] = usersRes.map((d: NewUserApiResponse) => {
          return {
            date: d.date,
            users: d.users,
          };
        });
        setUserData(usersApiData);

        const totalRevenue = apiData.reduce((sum, d) => sum + d.revenue, 0);
        const totalOrders = apiData.reduce((sum, d) => sum + d.orders, 0);
        const totalUsers = usersApiData.reduce((sum, d) => sum + d.users, 0);

        setSummary({
          revenue: `${totalRevenue.toLocaleString()} VND`,
          orders: totalOrders,
          users: totalUsers,
          growth: "+15%",
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [from, to]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="title-block">
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-subtitle">Tổng quan hoạt động — Doanh thu, đơn hàng và người dùng</p>
        </div>

        <div className="controls">
          <label className="control-item">
            Từ
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="control-item">
            Đến
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={FiDollarSign} title="Doanh thu" value={summary.revenue} color="green" hint="Tổng trong khoảng" />
        <StatCard icon={FiShoppingCart} title="Đơn hàng" value={summary.orders} color="blue" hint="Số đơn đã xử lý" />
        <StatCard icon={FiUsers} title="Người dùng mới" value={summary.users} color="purple" hint="Đăng ký trong khoảng" />
        <StatCard icon={FiTrendingUp} title="Tăng trưởng" value={summary.growth} color="orange" hint="So với kỳ trước" />
      </div>

      <div className="charts-wrap">
        <div className="chart-box">
          <div className="chart-head">
            <h3>Doanh thu theo tháng</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <div className="chart-head">
            <h3>Đơn hàng theo tháng</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Đơn hàng" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <div className="chart-head">
            <h3>Người dùng mới</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tickFormatter={(d) => d.split("-")[1]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#60a5fa" name="Người dùng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box products-box">
          <div className="chart-head">
            <h3>Top sản phẩm bán chạy</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={products}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="sold"
                name="Đã bán"
                fill="#fb923c"
                onClick={(barData: any) => {
                  const data = barData && barData.activePayload && barData.activePayload[0] && barData.activePayload[0].payload ? barData.activePayload[0].payload : barData;
                  if (data && data._id) {
                    navigate(`/products/${data._id}`);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      /> */}
    </div>
  );
}
