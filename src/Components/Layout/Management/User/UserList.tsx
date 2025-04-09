import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  LockOpen as LockOpenIcon,
  LockOutline as LockOutlineIcon,
} from "@mui/icons-material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axiosInstance from "../../../TokenRefresher";

// Define the User interface
interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
  phonenumber: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "inactive";
  postCount: number;
  followingCount: number;
  followersCount: number;
}

const UserList: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Sample static data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const getToken = () => {
    // Lấy token từ localStorage
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getToken();
        console.log("Token:", token);

        const response = await axiosInstance.get(
          "https://api-linkup.id.vn/api/admin/getAllUser",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Dữ liệu bài viết từ API:", response.data);
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          throw new Error("Dữ liệu API không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi tải bài đăng:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (error) return <Typography color="error">{error}</Typography>;

  // Responsive column definitions
  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    // Define columns based on screen size
    const responsiveColumns: GridColDef[] = [
      {
        field: "username",
        headerName: "Tên tài khoản",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 180,
      },
      {
        field: "type",
        headerName: "Vai trò",
        flex: 0.7,
        minWidth: 100,
      },
      {
        field: "createdAt",
        headerName: "Tạo vào lúc",
        flex: 0.7,
        minWidth: 120,
      },
      {
        field: "updatedAt",
        headerName: "Cập nhật lúc",
        flex: 0.7,
        minWidth: 120,
      },
      {
        field: "status",
        headerName: "Tình trạng",
        flex: 0.7,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor:
                params.value === "active" ? "success.light" : "error.light",
              color: "white",
              fontSize: "0.875rem",
            }}
          >
            {params.value === "active" ? "Hoạt động" : "Đã khóa"}
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "Trạng thái khác",
        sortable: false,
        width: 120,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Box>
            <IconButton
              size={isMobile ? "small" : "medium"}
              color="primary"
              onClick={() => handleOpenDialog(params.row)}
            >
              <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <IconButton
              size={isMobile ? "small" : "medium"}
              color="error"
              onClick={() =>
                handlePostStatusChange(params.row.id, params.row.status)
              } // Truyền vào postId và status hiện tại
            >
              {params.row.status === "active" ? (
                <LockOutlineIcon fontSize={isMobile ? "small" : "medium"} />
              ) : (
                <LockOpenIcon fontSize={isMobile ? "small" : "medium"} />
              )}
            </IconButton>
          </Box>
        ),
      },
    ];

    setColumns(responsiveColumns);
  }, [isMobile, isTablet]);

  const handleOpenDialog = (user: Partial<User> | null = null) => {
    setCurrentUser(
      user || { username: "", email: "", type: "User", status: "active" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const hideUser = async (userId: any) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn khóa tài khoản của người dùng này không?"
      )
    ) {
      setLoading(true); // Bắt đầu loading
      try {
        const token = getToken();
        if (!token) throw new Error("Token không hợp lệ");

        const response = await axiosInstance.put(
          `https://api-linkup.id.vn/api/admin/hideUser/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          console.log("Tài khoản đã được khóa");

          // Cập nhật lại trạng thái bài viết trong state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, status: "inactive" } : user
            )
          );
        } else {
          console.error("Không thể khóa tài khoản");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API hide post:", error);
      } finally {
        setLoading(false); // Tắt loading
      }
    }
  };

  const unhideUser = async (userId: any) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn mở khóa tài khoản của người dùng này không?"
      )
    ) {
      setLoading(true); // Bắt đầu loading
      try {
        const token = getToken();
        if (!token) throw new Error("Token không hợp lệ");

        const response = await axiosInstance.put(
          `https://api-linkup.id.vn/api/admin/unHideUser/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          console.log("Tài khoản đã được mở khóa");

          // Cập nhật lại trạng thái bài viết trong state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, status: "active" } : user
            )
          );
        } else {
          console.error("Không thể mở khóa tài khoản");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API unhide post:", error);
      } finally {
        setLoading(false); // Tắt loading
      }
    }
  };

  const handlePostStatusChange = async (userId: any, currentStatus: string) => {
    if (currentStatus === "active") {
      await hideUser(userId); // Nếu bài viết đang active thì gọi API hide
    } else {
      await unhideUser(userId); // Nếu bài viết đang ẩn thì gọi API unhide
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 2,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
          Quản lý người dùng
        </Typography>
      </Box>

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
        <Paper sx={{ height: { xs: 350, sm: 400 }, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
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
              ".MuiDataGrid-footerContainer": {
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                gap: 1,
              },
            }}
          />
        </Paper>
      )}

      {/* User Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Chi tiết</DialogTitle>
        <DialogContent
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {/* Hình ảnh người dùng */}
          <Box
            sx={{
              width: "40%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 3,
              borderRadius: 2,
              padding: 2,
            }}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser?.avatar}
                alt="User avatar"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  height: "auto",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ fontStyle: "italic" }}
              >
                Không có hình ảnh
              </Typography>
            )}
          </Box>

          {/* Thông tin người dùng */}
          <Box sx={{ width: "55%", paddingLeft: 3 }}>
            {/* Tên tài khoản */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Tên tài khoản
              </Typography>
              <Box
                sx={{
                  padding: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {currentUser?.username}
                </Typography>
              </Box>
            </Box>

            {/* Email người dùng */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Email người dùng
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>

            {/* Số điện thoại người dùng */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Số điện thoại
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {currentUser?.phonenumber}
                </Typography>
              </Box>
            </Box>

            {/* Thống kê tài khoản */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Hoạt động tài khoản
              </Typography>
              <Box
                sx={{
                  padding: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Bài viết: {currentUser?.postCount} 
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Đang theo dõi:{" "} {currentUser?.followingCount} | Người theo dõi:{" "}
                  {currentUser?.followersCount}
                </Typography>
              </Box>
            </Box>

            {/* Trạng thái người dùng */}
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Trạng thái tài khoản
              </Typography>
              <Box
                sx={{
                  padding: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color={currentUser?.status === "active" ? "green" : "red"}
                  fontWeight="bold"
                >
                  {currentUser?.status === "active"
                    ? "Đang hoạt động"
                    : "Đã bị khóa"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant={isMobile ? "outlined" : "text"}
            fullWidth={isMobile}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          bottom: { xs: 70, sm: 24 }, // Move snackbar up on mobile to avoid bottom nav
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserList;
