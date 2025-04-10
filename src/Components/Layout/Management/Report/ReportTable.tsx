import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme as useMuiTheme,
  Button,
  IconButton,
  Avatar,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axiosInstance from "../../../TokenRefresher";

interface Report {
  id: number;
  reporterName: string;
  reporterAvatar: string;
  reportedId: number;
  reportedContent: string;
  reportedAvatar?: string;
  reason: string;
  type: "post" | "user";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const ReportTable: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<"post" | "user">("post");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get(
          "https://api-linkup.id.vn/api/admin/getReport",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            withCredentials: true,
          }
        );

        if (res.data.isSuccess) {
            const mappedReports: Report[] = res.data.data.map((item: any) => {
              let reportedContent = "";
              let reportedAvatar = "";
          
              if (item.type === "post") {
                reportedContent = item.reported?.content || "[Bài đăng đã bị xoá]";
              } else if (item.type === "user") {
                reportedContent = item.reported?.username || "[Người dùng đã bị xoá]";
                reportedAvatar = item.reported?.avatar || "";
              } else if (item.type === "message") {
                reportedContent = item.reported?.content || "[Tin nhắn đã bị xoá]";
              }
          
              return {
                id: item.id,
                reporterName: item.reporter?.username || "Ẩn danh",
                reporterAvatar: item.reporter?.avatar || "",
                reportedId: item.reported?.id || 0,
                reportedContent,
                reportedAvatar,
                reason: item.reason || "Không rõ",
                type: item.type,
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              };
            });
          
            setReports(mappedReports);
          } else {
          setError(res.data.message || "Lỗi không xác định");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API báo cáo:", err);
        setError("Không thể tải dữ liệu báo cáo.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getColumnsByType = (
    type: "post" | "user" | "message"
  ): GridColDef[] => {
    const reportedHeaderNameMap = {
      post: "Bài viết bị báo cáo",
      user: "Người dùng bị báo cáo",
      message: "Tin nhắn bị báo cáo",
    };

    return [
      { field: "id", headerName: "ID", width: 70 },
      { field: "type", headerName: "Loại", width: 100 },
      { field: "reporterName", headerName: "Người báo cáo", width: 150 },
      {
        field: "reportedContent",
        headerName: reportedHeaderNameMap[type] || "Nội dung bị báo cáo",
        flex: 1,
        minWidth: 200,
      },
      { field: "reason", headerName: "Lý do", width: 120 },
      {
        field: "status",
        headerName: "Trạng thái",
        width: 120,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value;
          const color =
            value === "pending"
              ? "warning.light"
              : value === "approved"
              ? "success.light"
              : "error.light";
          const label =
            value === "pending"
              ? "Chờ duyệt"
              : value === "approved"
              ? "Đã duyệt"
              : "Từ chối";
          return (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor:
                  params.value === "active" ? "success.light" : "warning.light",
                color: "white",
                fontSize: "0.875rem",
              }}
            >
              {label}
            </Box>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Tạo vào lúc",
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<Report>) => {
          const createdAt = params.row.createdAt;
          const date = new Date(createdAt);
          const formattedDate = date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return <p>{formattedDate}</p>;
        },
      },
      {
        field: "action",
        headerName: "Hành động",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        ),
      },
    ];
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: "post" | "user"
  ) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (report: Report) => {
    setCurrentReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReport(null);
  };

  const filteredReports = reports.filter((r) => r.type === tabValue);

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Quản lý báo cáo
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Báo cáo bài viết" value="post" />
        <Tab label="Báo cáo người dùng" value="user" />
        <Tab label="Báo cáo tin nhắn" value="message" />
      </Tabs>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 350,
          }}
        >
          <DotLottieReact
            src="https://lottie.host/4317e538-059d-4430-8356-7cefeb8c7d2a/xXEWSPAvFR.lottie"
            loop
            autoplay
          />
        </Box>
      ) : (
        <Paper sx={{ height: { xs: 400, sm: 500 }, width: "100%" }}>
          <DataGrid
            rows={filteredReports}
            columns={getColumnsByType(tabValue)} // sửa ở đây
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
              },
            }}
            pageSizeOptions={isMobile ? [5] : [5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: 0,
              ".MuiDataGrid-columnHeaders": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
              },
              ".MuiDataGrid-cell": {
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              },
              ".MuiDataGrid-columnHeaderTitle": {
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              },
              ".MuiDataGrid-footerCell": {
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              },
            }}
          />
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết Báo cáo</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {currentReport && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Loại:</strong>{" "}
                {currentReport.type === "post" ? "Bài đăng" : "Người dùng"}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Lý do:</strong> {currentReport.reason}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Trạng thái:</strong>{" "}
                {currentReport.status === "pending"
                  ? "Chờ duyệt"
                  : currentReport.status === "approved"
                  ? "Đã duyệt"
                  : "Từ chối"}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(currentReport.createdAt).toLocaleString("vi-VN")}
              </Typography>

              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Người báo cáo
                </Typography>
                <Box display="flex" alignItems="center">
                  <Avatar src={currentReport.reporterAvatar} sx={{ mr: 2 }} />
                  <Typography>{currentReport.reporterName}</Typography>
                </Box>
              </Box>

              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  {currentReport.type === "post"
                    ? "Bài đăng bị báo cáo"
                    : "Người dùng bị báo cáo"}
                </Typography>
                <Box display="flex" alignItems="center">
                  {currentReport.reportedAvatar && (
                    <Avatar src={currentReport.reportedAvatar} sx={{ mr: 2 }} />
                  )}
                  <Typography>{currentReport.reportedContent}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportTable;
