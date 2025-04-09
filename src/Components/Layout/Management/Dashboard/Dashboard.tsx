import React, { useEffect, useState, useRef } from "react";
import {
  FaUser,
  FaFileAlt,
  FaMoneyBill,
  FaComment,
  FaHeart,
  FaEnvelope,
  FaDownload,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  LabelList,
} from "recharts";
import DashboardCard from "Components/DashboardCard/DashboardCard";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoImage from "./Nội dung đoạn văn bản của bạn.jpg"; // Giả sử bạn có file logo tại đây
import html2canvas from "html2canvas";
import axiosInstance from "../../../TokenRefresher";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const revenueChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await axiosInstance.get(
        "https://api-linkup.id.vn/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(data.data);
      setStats(data.data);
    };
    fetchStats();
  }, []);

  const handleExportExcel = async () => {
    console.log("Exporting to Excel...");
    // Capture chart images first
    if (
      !barChartRef.current ||
      !lineChartRef.current ||
      !revenueChartRef.current
    )
      return;

    try {
      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Thống kê");

      // Merge tiêu đề và style
      worksheet.mergeCells("A1", "F1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "📊 BÁO CÁO THỐNG KÊ DASHBOARD";
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3B82F6" },
      };
      worksheet.getRow(1).height = 30;

      // Header
      worksheet.addRow(["Loại thống kê", "Giá trị"]);
      const headerRow = worksheet.getRow(2);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E0E7FF" },
      };
      headerRow.alignment = { horizontal: "center" };

      // Dữ liệu
      const data = [
        ["Tổng người dùng", stats.totalUsers],
        ["Tổng Bài viết", stats.totalTextPosts + stats.totalVideoPosts],
        ["Tổng bình luận", stats.totalComments],
        ["Tổng lượt thích", stats.totalLikes],
        ["Tổng tin nhắn", stats.totalMessages],
      ];

      data.forEach((row, idx) => {
        const newRow = worksheet.addRow(row);
        if (idx % 2 === 0) {
          newRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F9FAFB" },
          };
        }
      });

      worksheet.columns = [
        { key: "label", width: 30 },
        { key: "value", width: 20 },
      ];

      // Chèn logo (nếu có)
      try {
        const imageData = await fetch(logoImage).then((r) => r.blob());
        const buffer = await imageData.arrayBuffer();
        const imageId = workbook.addImage({
          buffer,
          extension: "png",
        });

        worksheet.addImage(imageId, {
          tl: { col: 4, row: 0.2 },
          ext: { width: 100, height: 50 },
        });
      } catch (error) {
        console.error("Lỗi khi chèn logo:", error);
      }

      // Capture và chèn biểu đồ cột
      const barChartCanvas = await html2canvas(barChartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const barChartBlob = await new Promise<Blob>((resolve) => {
        barChartCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      const barChartBuffer = await barChartBlob.arrayBuffer();
      const barChartImageId = workbook.addImage({
        buffer: barChartBuffer,
        extension: "png",
      });

      // Thêm tiêu đề biểu đồ cột
      worksheet.addRow([]); // Thêm dòng trống
      const barChartTitleRow = worksheet.addRow(["Thống kê tổng quan"]);
      barChartTitleRow.font = { bold: true, size: 14 };
      worksheet.addRow([]); // Thêm dòng trống

      // Chèn biểu đồ cột vào Excel
      worksheet.addImage(barChartImageId, {
        tl: { col: 0, row: worksheet.rowCount - 1 },
        ext: { width: 600, height: 300 },
      });

      // Thêm khoảng trống sau biểu đồ
      for (let i = 0; i < 16; i++) {
        worksheet.addRow([]);
      }

      // Capture và chèn biểu đồ đường
      const lineChartCanvas = await html2canvas(lineChartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const lineChartBlob = await new Promise<Blob>((resolve) => {
        lineChartCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      const lineChartBuffer = await lineChartBlob.arrayBuffer();
      const lineChartImageId = workbook.addImage({
        buffer: lineChartBuffer,
        extension: "png",
      });

      // Thêm tiêu đề biểu đồ đường
      const lineChartTitleRow = worksheet.addRow([
        "Bài viết & Bình luận theo tháng",
      ]);
      lineChartTitleRow.font = { bold: true, size: 14 };
      worksheet.addRow([]); // Thêm dòng trống

      // Chèn biểu đồ đường vào Excel
      worksheet.addImage(lineChartImageId, {
        tl: { col: 0, row: worksheet.rowCount - 1 },
        ext: { width: 600, height: 300 },
      });

      for (let i = 0; i < 16; i++) {
        worksheet.addRow([]);
      }

      // Capture và chèn biểu đồ đường
      const revenueChartCanvas = await html2canvas(revenueChartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const revenueChartBlob = await new Promise<Blob>((resolve) => {
        revenueChartCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      const revenueChartBuffer = await revenueChartBlob.arrayBuffer();
      const revenueChartImageId = workbook.addImage({
        buffer: revenueChartBuffer,
        extension: "png",
      });

      // Thêm tiêu đề biểu đồ đường
      const revenueChartTitleRow = worksheet.addRow(["Doanh thu theo tháng"]);
      revenueChartTitleRow.font = { bold: true, size: 14 };
      worksheet.addRow([]); // Thêm dòng trống

      // Chèn biểu đồ đường vào Excel
      worksheet.addImage(revenueChartImageId, {
        tl: { col: 0, row: worksheet.rowCount - 1 },
        ext: { width: 600, height: 300 },
      });

      // Xuất file
      const bufferExcel = await workbook.xlsx.writeBuffer();
      const blob = new Blob([bufferExcel], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `dashboard_stats_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (error) {
      console.error("Lỗi khi xuất Excel với biểu đồ:", error);
      alert("Đã xảy ra lỗi khi xuất Excel. Vui lòng thử lại sau.");
    }
  };

  // Hàm xuất biểu đồ riêng lẻ thành ảnh
  const exportChartAsImage = async (
    elementRef: React.RefObject<HTMLDivElement>,
    fileName: string
  ) => {
    if (!elementRef.current) return;

    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Tăng độ phân giải
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(
            blob,
            `${fileName}_${new Date().toISOString().slice(0, 10)}.png`
          );
        }
      }, "image/png");
    } catch (error) {
      console.error("Lỗi khi xuất biểu đồ:", error);
    }
  };

  if (!stats) return <div className="p-4">Loading...</div>;

  const chartData = [
    { name: "Người dùng", value: stats.totalUsers },
    { name: "Bài viết", value: stats.totalTextPosts + stats.totalVideoPosts },
    { name: "Bình luận", value: stats.totalComments },
    { name: "Lượt thích", value: stats.totalLikes },
    { name: "Tin nhắn", value: stats.totalMessages },
  ];

  // Dữ liệu mock theo tháng (giả lập)
  const lineChartData = [
    { month: "Jan", posts: 45, comments: 120 },
    { month: "Feb", posts: 60, comments: 150 },
    { month: "Mar", posts: 70, comments: 170 },
    { month: "Apr", posts: 85, comments: 210 },
    { month: "May", posts: 95, comments: 230 },
    { month: "Jun", posts: 110, comments: 250 },
    { month: "Jul", posts: 105, comments: 240 },
    { month: "Aug", posts: 120, comments: 260 },
    { month: "Sep", posts: 130, comments: 270 },
    { month: "Oct", posts: 140, comments: 290 },
    { month: "Nov", posts: 150, comments: 310 },
    { month: "Dec", posts: 160, comments: 320 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 500 },
    { month: "Feb", revenue: 700 },
    { month: "Mar", revenue: 600 },
    { month: "Apr", revenue: 800 },
    { month: "May", revenue: 700 },
    { month: "Jun", revenue: 1100 },
    { month: "Jul", revenue: 1300 },
    { month: "Aug", revenue: 1000 },
    { month: "Sep", revenue: 1200 },
    { month: "Oct", revenue: 1300 },
    { month: "Nov", revenue: 900 },
    { month: "Dec", revenue: 1200 },
  ];

  const totalRevenue = revenueData.reduce(
    (total, current) => total + current.revenue,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-4 m-0">
        <button
          onClick={handleExportExcel}
          className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow flex items-center gap-2"
        >
          <FaDownload /> Xuất Excel
        </button>
      </div>
      {/* Các thẻ thống kê */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        style={{ marginTop: 0 }}
      >
        <DashboardCard
          title="Người dùng"
          value={stats.totalUsers}
          icon={<FaUser />}
        />
        <DashboardCard
          title="Tổng Bài viết"
          value={stats.totalTextPosts + stats.totalVideoPosts}
          icon={<FaFileAlt />}
        />
        <DashboardCard
          title="Tổng doanh thu từ quảng cáo"
          value={totalRevenue} // Gọi hàm formatRevenue để lấy giá trị đã định dạng
          icon={<FaMoneyBill />}
        />
        <DashboardCard
          title="Bình luận"
          value={stats.totalComments}
          icon={<FaComment />}
        />
        <DashboardCard
          title="Lượt thích"
          value={stats.totalLikes}
          icon={<FaHeart />}
        />
        <DashboardCard
          title="Tin nhắn"
          value={stats.totalMessages}
          icon={<FaEnvelope />}
        />
        
      </div>

      {/* Biểu đồ cột */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Thống kê tổng quan</h2>
          <button
            onClick={() =>
              exportChartAsImage(barChartRef, "thong_ke_tong_quan")
            }
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow flex items-center gap-2"
          >
            <FaDownload size={14} /> Tải ảnh
          </button>
        </div>
        <div ref={barChartRef}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#333"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ line */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bài viết & Bình luận theo tháng</h2>
          <button
            onClick={() =>
              exportChartAsImage(lineChartRef, "bai_viet_binh_luan_theo_thang")
            }
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow flex items-center gap-2"
          >
            <FaDownload size={14} /> Tải ảnh
          </button>
        </div>
        <div ref={lineChartRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="#3b82f6"
                name="Bài viết"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#f97316"
                name="Bình luận"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Doanh thu quảng cáo theo tháng</h2>
          <button
            onClick={() =>
              exportChartAsImage(revenueChartRef, "doanh_thu_quang_cao")
            }
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow flex items-center gap-2"
          >
            <FaDownload size={14} /> Tải ảnh
          </button>
        </div>
        <div ref={revenueChartRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                name="Doanh thu"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
