import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Divider,
  useTheme as useMuiTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Stack,
  Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "../../../context/ThemeContext";
import axiosInstance from "../../TokenRefresher";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshPosts: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, refreshPosts }) => {
  const [user, setUser] = useState<{
    username: string;
    email: string;
    phonenumber: string;
    realname: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [content, setContent] = useState("");
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const url = "https://api-linkup.id.vn/api/media/createMedia";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue.length > 250 ? newValue.slice(0, 250) : newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[0];

    if (fileType === "image") {
      setImage(file);
      setVideo(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setVideoPreview(null);
      };
      reader.readAsDataURL(file);
    } else if (fileType === "video") {
      setVideo(file);
      setImage(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImage(null);
  };

  const handleRemoveVideo = () => {
    setVideoPreview(null);
    setVideo(null);
  };

  const handleConfirm = async () => {
    const userId = localStorage.getItem("currentUserId");
    const token = localStorage.getItem("accessToken");

    if (!userId) {
      console.log("Không tìm thấy ID người dùng.");
      setIsLoading(false);
      return;
    }
    if (!content.trim()) {
      console.log("Không tìm thấy nội dung bài viết");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (image) {
        formData.append("file", image);
        formData.append("type", "post");
      } else if (video) {
        formData.append("file", video);
        formData.append("type", "video");
      } else {
        formData.append("type", "post");
      }

      const response = await axiosInstance.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      if (response.status === 200) {
        setContent("");
        setImage(null);
        setVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        onClose();
        refreshPosts();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      console.log("Có lỗi xảy ra, vui lòng thử lại.");
    }
    setIsLoading(false);
  };

  const getCharCount = () => {
    return `${content.length}/250`;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          bgcolor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: 1, 
        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)" 
      }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          Tạo bài viết mới
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src="https://via.placeholder.com/80" 
            alt={user?.username || "User"} 
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 2, 
              mt: 1 // Added margin-top
            }} 
          />
          <Typography 
            variant="subtitle1" 
            fontWeight="medium"
            sx={{
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          >
            {user?.username || "User"}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={10}
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            sx: {
              bgcolor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
              "& fieldset": {
                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
              },
            }
          }}
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Typography variant="caption" color="text.secondary">
            {getCharCount()}
          </Typography>
        </Box>

        {(imagePreview || videoPreview) && (
          <Paper 
            variant="outlined" 
            sx={{ 
              position: "relative",
              p: 1,
              mb: 2,
              bgcolor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
              borderRadius: 2
            }}
          >
            {imagePreview && (
              <Box sx={{ position: "relative" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ 
                    width: "100%", 
                    maxHeight: "300px", 
                    objectFit: "contain", 
                    borderRadius: "8px"
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                  }}
                  size="small"
                  onClick={handleRemoveImage}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}

            {videoPreview && (
              <Box sx={{ position: "relative" }}>
                <video
                  controls
                  style={{ 
                    width: "100%", 
                    maxHeight: "300px", 
                    borderRadius: "8px" 
                  }}
                >
                  <source src={videoPreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                  }}
                  size="small"
                  onClick={handleRemoveVideo}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          id="mediaUpload"
          style={{ display: "none" }}
        />
        
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Thêm vào bài viết
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Thêm ảnh">
              <label htmlFor="mediaUpload">
                <Button
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{ 
                    color: theme === "dark" ? "#4CAF50" : "#2E7D32",
                    "&:hover": { bgcolor: theme === "dark" ? "rgba(76, 175, 80, 0.1)" : "rgba(46, 125, 50, 0.1)" }
                  }}
                >
                  Ảnh
                </Button>
              </label>
            </Tooltip>
            
            <Tooltip title="Thêm video">
              <label htmlFor="mediaUpload">
                <Button
                  component="span"
                  startIcon={<VideoLibraryIcon />}
                  sx={{ 
                    color: theme === "dark" ? "#2196F3" : "#0D47A1",
                    "&:hover": { bgcolor: theme === "dark" ? "rgba(33, 150, 243, 0.1)" : "rgba(13, 71, 161, 0.1)" }
                  }}
                >
                  Video
                </Button>
              </label>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        justifyContent: "flex-end",
        borderTop: 1,
        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"
      }}>
        <Button
          variant="contained"
          fullWidth
          disabled={isLoading || content.trim() === ""}
          onClick={handleConfirm}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            py: 1,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {isLoading ? "Đang đăng..." : "Đăng bài viết"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostModal;