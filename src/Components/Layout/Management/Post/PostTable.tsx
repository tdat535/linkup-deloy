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
  Avatar,
  Tabs,
  Tab
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  LockOpen as LockOpenIcon,
  LockOutlined as LockOutlineIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon
} from "@mui/icons-material";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import VideoThumbnail from "../../VideoThumbnail/VideoThumbnail";
import axiosInstance from "../../../TokenRefresher";

interface Post {
  id: string;
  User: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
  mediaUrl: string;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  status: string;
  type: string;
}

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`post-tabpanel-${index}`}
//       aria-labelledby={`post-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box sx={{ p: 3 }}>
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// }

function a11yProps(index: number) {
  return {
    id: `post-tab-${index}`,
    'aria-controls': `post-tabpanel-${index}`,
  };
}

const PostTable: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Sample static data
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
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
          "https://api-linkup.id.vn/api/admin/getAllMediaPost", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        console.log("Dữ liệu bài viết từ API:", response.data);
        if (Array.isArray(response.data.data)) {
          console.log("Bài viết với loại:", response.data.data);
          setPosts(response.data.data);
          // Ban đầu hiển thị tất cả bài đăng
          setFilteredPosts(response.data.data);
        } else {
          throw new Error("Dữ liệu API không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi tải bài đăng:", error);
        setError("Không thể tải bài đăng.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on selected tab
  useEffect(() => {
    if (posts.length > 0) {
      if (tabValue === 0) {
        // All posts
        setFilteredPosts(posts);
      } else if (tabValue === 1) {
        // Only image posts
        setFilteredPosts(posts.filter(post => post.type === "post"));
      } else if (tabValue === 2) {
        // Only video posts
        setFilteredPosts(posts.filter(post => post.type === "video"));
      }
    }
  }, [tabValue, posts]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (error) return <Typography color="error">{error}</Typography>;

  // Responsive column definitions
  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    // Define columns based on screen size and tab
    const responsiveBaseColumns: GridColDef[] = [
      {
        field: "id",
        headerName: "Post ID",
        flex: 0.5,
        minWidth: 80,
      },
      {
        field: "user_id",
        headerName: "User ID",
        flex: 0.5,
        minWidth: 80,
        renderCell: (params: GridRenderCellParams<Post>) => {
          const userId = params.row.User?.id;
          return <p>{userId}</p>;
        },
      },
      {
        field: "type",
        headerName: "Loại",
        flex: 0.5,
        minWidth: 80,
        renderCell: (params: GridRenderCellParams<Post>) => {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', }}>
              {params.row.type === "video" ? (
                <>
                  <VideoIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Video</Typography>
                </>
              ) : (
                <>
                  <ImageIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Hình ảnh</Typography>
                </>
              )}
            </Box>
          );
        }
      },
      {
        field: "content",
        headerName: "Nội dung bài đăng",
        flex: 1.5,
        minWidth: 100,
      },
      {
        field: "createdAt",
        headerName: "Tạo vào lúc",
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<Post>) => {
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
        field: "status",
        headerName: "Tình trạng",
        flex: 0.7,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<Post>) => (
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
            {params.value === "active" ? "Hiện thị" : "Đã Ẩn"}
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "Hành động",
        sortable: false,
        width: 120,
        renderCell: (params: GridRenderCellParams<Post>) => (
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
              }
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

    // Add media column based on tab
    const imageColumn: GridColDef = {
      field: "image",
      headerName: "Hình ảnh",
      flex: 1,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<Post>) => {
        const imageUrl = params.row.mediaUrl;
        if (!imageUrl) {
          return (
            <Box
              sx={{
                height: "100%", // chiếm toàn bộ chiều cao của ô
                display: "flex",
                alignItems: "center", // căn giữa theo chiều dọc
              }}
            >
              <Typography variant="body2">Không có hình ảnh</Typography>
            </Box>
          );
        }

        return (
          <img
            src={imageUrl}
            alt="Image"
            style={{
              width: "80px",
              height: "80px", 
              objectFit: "contain",
            }}
          />
        );
      },
    };

    const videoColumn: GridColDef = {
      field: "video",
      headerName: "Video",
      flex: 1,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<Post>) => {
        const videoUrl = params.row.mediaUrl;
        if (!videoUrl) {
          return (
            <Box
              sx={{
                height: "100%", // chiếm toàn bộ chiều cao của ô
                display: "flex",
                alignItems: "center", // căn giữa theo chiều dọc
              }}
            >
              <Typography variant="body2">Không có video</Typography>
            </Box>
          );      
        }

        return (
          <Box sx={{ 
            width: "120px", 
            height: "80px", 
            position: "relative",
            display: "flex",
            alignItems: "center", // căn giữa theo chiều dọc
          }}>
            <VideoThumbnail url={params.row.mediaUrl} />
          </Box>
        );
      },
    };

    // Insert media column at position 3 (after user_id)
    let updatedColumns = [...responsiveBaseColumns];
    if (tabValue === 0) {
      // Both media types - add image column by default
      updatedColumns.splice(3, 0, imageColumn);
    } else if (tabValue === 1) {
      // Image posts only
      updatedColumns.splice(3, 0, imageColumn);
    } else if (tabValue === 2) {
      // Video posts only
      updatedColumns.splice(3, 0, videoColumn);
    }

    setColumns(updatedColumns);
  }, [isMobile, isTablet, tabValue]);

  const handleOpenDialog = (post: Partial<Post> | null = null) => {
    setCurrentPost(post || { content: "", mediaUrl: "", status: "active", type: "post" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPost(null);
  };

  const hidePost = async (postId: any) => {
    if (window.confirm("Bạn có chắc chắn muốn ẩn bài viết này không?")) {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Token không hợp lệ");

        const response = await axiosInstance.put(
          `https://api-linkup.id.vn/api/admin/hidePost/${postId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          console.log("Bài viết đã được ẩn");

          // Cập nhật lại trạng thái bài viết trong state
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, status: "inactive" } : post
            )
          );
          setSnackbar({
            open: true,
            message: "Bài viết đã được ẩn thành công",
            severity: "success",
          });
        } else {
          console.error("Không thể ẩn bài viết");
          setSnackbar({
            open: true,
            message: "Không thể ẩn bài viết",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Lỗi khi gọi API hide post:", error);
        setSnackbar({
          open: true,
          message: "Đã xảy ra lỗi khi ẩn bài viết",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const unhidePost = async (postId: any) => {
    if (
      window.confirm("Bạn có chắc chắn muốn hiện thị lại bài viết này không?")
    ) {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Token không hợp lệ");

        const response = await axiosInstance.put(
          `https://api-linkup.id.vn/api/admin/unHidePost/${postId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          console.log("Bài viết đã được hiển thị lại");

          // Cập nhật lại trạng thái bài viết trong state
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, status: "active" } : post
            )
          );
          setSnackbar({
            open: true,
            message: "Bài viết đã được hiển thị lại thành công",
            severity: "success",
          });
        } else {
          console.error("Không thể hiển thị bài viết");
          setSnackbar({
            open: true,
            message: "Không thể hiển thị lại bài viết",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Lỗi khi gọi API unhide post:", error);
        setSnackbar({
          open: true,
          message: "Đã xảy ra lỗi khi hiển thị lại bài viết",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePostStatusChange = async (postId: any, currentStatus: string) => {
    if (currentStatus === "active") {
      await hidePost(postId);
    } else {
      await unhidePost(postId);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
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
          <Typography variant="h5" component="h2">
            Quản lý bài đăng
          </Typography>
        </Box>

        {/* Tab navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="post management tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : undefined}
          >
            <Tab 
              icon={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                Tất cả
              </Box>} 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                Hình ảnh
              </Box>} 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VideoIcon fontSize="small" sx={{ mr: 0.5 }} />
                Video
              </Box>} 
              {...a11yProps(2)} 
            />
          </Tabs>
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
          <Paper sx={{ height: { xs: 350, sm: 450 }, width: "100%" }}>
            <DataGrid
              rows={filteredPosts}
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
                ".MuiDataGrid-footerCell": {
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                },
              }}
            />
          </Paper>
        )}

        {/* Snackbar */}
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

        {/* Dialog - Modified to handle both post and video */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{ fontWeight: "bold", fontSize: 24, textAlign: "center" }}
          >
            {currentPost?.type === "video" ? "Chi tiết Video" : "Chi tiết Bài Đăng"}
          </DialogTitle>
          <DialogContent
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Hình ảnh bài viết hoặc Video */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: 3,
                  borderRadius: 2,
                  padding: 2,
                  marginBottom: 2,
                }}
              >
                {currentPost?.type === "video" && currentPost?.mediaUrl ? (
                  <Box sx={{ width: "100%", maxWidth: "330px" }}>
                    <video
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 8,
                      }}
                      poster={currentPost?.mediaUrl}
                    >
                      <source src={currentPost.mediaUrl} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  </Box>
                ) : currentPost?.mediaUrl ? (
                  <img
                    src={currentPost?.mediaUrl}
                    alt="Post image"
                    style={{
                      width: "100%",
                      maxWidth: "330px",
                      height: "auto",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "362px",
                      height: "362px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: 3,
                      borderRadius: 2,
                      padding: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      textAlign="center"
                      sx={{ fontStyle: "italic" }}
                    >
                      {currentPost?.type === "video" ? "Không có video" : "Không có hình ảnh"}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Like và Comment count */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 2,
                  paddingTop: 1,
                  borderTop: "1px solid #f5f5f5",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" color="textSecondary" mr={1}>
                    Lượt thích:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {currentPost?.likeCount}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" color="textSecondary" mr={1}>
                    Bình luận:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {currentPost?.commentCount}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Thông tin bài viết */}
            <Box sx={{ width: "55%", paddingLeft: 3 }}>
              {/* Loại bài đăng */}
              <Box mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Loại bài đăng
                </Typography>
                <Box
                  sx={{
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {currentPost?.type === "video" ? (
                    <>
                      <VideoIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="bold">
                        Video
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ImageIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="bold">
                        Hình ảnh
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              
              {/* Tiêu đề bài viết */}
              <Box mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Nội dung bài viết
                </Typography>
                <Box
                  sx={{
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {currentPost?.content}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin người dùng */}
              <Box mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Thông tin người dùng
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
                  <Avatar
                    src={currentPost?.User?.avatar}
                    alt={currentPost?.User?.username}
                    sx={{ width: 40, height: 40, marginRight: 2 }}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {currentPost?.User?.username}
                  </Typography>
                </Box>
              </Box>

              {/* Trạng thái bài viết */}
              <Box mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Trạng thái bài viết
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
                    color={currentPost?.status === "active" ? "green" : "red"}
                    fontWeight="bold"
                  >
                    {currentPost?.status === "active"
                      ? "Đang hiển thị"
                      : "Đã bị khóa"}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Ngày đăng
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
                    {currentPost?.createdAt
                      ? new Date(currentPost.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )
                      : "Không xác định"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} style={{ color: "white", backgroundColor: "blue" }}>
              Đóng
            </Button>
            
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default PostTable;