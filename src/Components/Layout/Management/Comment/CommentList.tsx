import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

// Define the Comment interface
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at?: string;
}

const CommentList: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Sample static data
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', post_id: '101', user_id: '1', content: 'Bài viết rất hay!', status: 'approved', created_at: '2023-01-01', updated_at: '2023-01-02' },
    { id: '2', post_id: '102', user_id: '2', content: 'Tôi không đồng ý với quan điểm này.', status: 'pending', created_at: '2023-02-15', updated_at: '2023-02-15' },
    { id: '3', post_id: '101', user_id: '3', content: 'Cần thêm thông tin chi tiết.', status: 'approved', created_at: '2023-03-22', updated_at: '2023-03-23' },
    { id: '4', post_id: '103', user_id: '1', content: 'Nội dung này vi phạm quy định cộng đồng.', status: 'rejected', created_at: '2023-04-05', updated_at: '2023-04-06' },
  ]);
  
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentComment, setCurrentComment] = useState<Partial<Comment> | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Responsive column definitions
  const [columns, setColumns] = useState<GridColDef[]>([]);
  
  useEffect(() => {
    // Define columns based on screen size
    const responsiveColumns: GridColDef[] = [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 70,
      },
      { 
        field: 'post_id', 
        headerName: 'ID Bài viết', 
        width: 90,
      },
      { 
        field: 'user_id', 
        headerName: 'ID Người dùng', 
        width: 110,
      },
      { 
        field: 'content', 
        headerName: 'Nội dung', 
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<Comment>) => (
          <Box sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </Box>
        )
      },
      { 
        field: 'status', 
        headerName: 'Trạng thái', 
        flex: 0.7,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<Comment>) => {
          let color;
          let label;
          
          switch(params.value) {
            case 'approved':
              color = 'success.light';
              label = 'Đã duyệt';
              break;
            case 'pending':
              color = 'warning.light';
              label = 'Chờ duyệt';
              break;
            case 'rejected':
              color = 'error.light';
              label = 'Từ chối';
              break;
            default:
              color = 'grey.500';
              label = params.value;
          }
          
          return (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: color,
                color: 'white',
                fontSize: '0.875rem',
              }}
            >
              {label}
            </Box>
          );
        }
      },
      { 
        field: 'created_at', 
        headerName: 'Ngày tạo', 
        flex: 0.7,
        minWidth: 120,
      },
      { 
        field: 'actions', 
        headerName: 'Thao tác', 
        sortable: false, 
        width: 120,
        renderCell: (params: GridRenderCellParams<Comment>) => (
          <Box>
            <IconButton size={isMobile ? "small" : "medium"} color="primary" onClick={() => handleOpenDialog(params.row)}>
              <EditIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <IconButton size={isMobile ? "small" : "medium"} color="error" onClick={() => handleDeleteComment(params.row.id)}>
              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Box>
        )
      },
    ];
    
    setColumns(responsiveColumns);
  }, [isMobile, isTablet]);

  const handleOpenDialog = (comment: Partial<Comment> | null = null) => {
    setCurrentComment(comment || { post_id: '', user_id: '', content: '', status: 'pending' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentComment(null);
  };

  const handleSaveComment = () => {
    if (!currentComment || !currentComment.post_id || !currentComment.user_id || !currentComment.content) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin',
        severity: 'error'
      });
      return;
    }

    if (currentComment.id) {
      // Update existing comment in our local state
      setComments(comments.map(comment => 
        comment.id === currentComment.id ? { 
          ...comment, 
          ...currentComment,
          updated_at: new Date().toISOString().split('T')[0]
        } as Comment : comment
      ));
      setSnackbar({
        open: true,
        message: 'Cập nhật bình luận thành công',
        severity: 'success'
      });
    } else {
      // Create new comment in our local state
      const newComment = {
        ...currentComment,
        id: Date.now().toString(),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      } as Comment;
      
      setComments([...comments, newComment]);
      setSnackbar({
        open: true,
        message: 'Thêm bình luận thành công',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteComment = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      setComments(comments.filter(comment => comment.id !== id));
      setSnackbar({
        open: true,
        message: 'Xóa bình luận thành công',
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 2,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Quản lý bình luận
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
        >
          Thêm bình luận
        </Button>
      </Box>

      <Paper sx={{ height: { xs: 350, sm: 400 }, width: '100%' }}>
        <DataGrid
          rows={comments}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
            },
            filter: {
              filterModel: {
                items: []
              },
            },
          }}
          pageSizeOptions={isMobile ? [5] : [5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ 
            border: 0,
            '.MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
            },
            '.MuiDataGrid-cell': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            },
            '.MuiDataGrid-columnHeaderTitle': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            },
            '.MuiDataGrid-footerContainer': {
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: 1
            }
          }}
        />
      </Paper>

      {/* Comment Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {currentComment?.id ? 'Chỉnh sửa bình luận' : 'Thêm bình luận mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="ID Bài viết"
              value={currentComment?.post_id || ''}
              onChange={(e) => setCurrentComment({ ...currentComment, post_id: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="ID Người dùng"
              value={currentComment?.user_id || ''}
              onChange={(e) => setCurrentComment({ ...currentComment, user_id: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nội dung bình luận"
              multiline
              rows={4}
              value={currentComment?.content || ''}
              onChange={(e) => setCurrentComment({ ...currentComment, content: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              select
              label="Trạng thái"
              value={currentComment?.status || 'pending'}
              onChange={(e) => setCurrentComment({ 
                ...currentComment, 
                status: e.target.value as 'approved' | 'pending' | 'rejected' 
              })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} variant={isMobile ? "outlined" : "text"} fullWidth={isMobile}>Hủy</Button>
          <Button onClick={handleSaveComment} variant="contained" color="primary" fullWidth={isMobile}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ 
          bottom: { xs: 70, sm: 24 }, // Move snackbar up on mobile to avoid bottom nav
          width: { xs: '100%', sm: 'auto' }
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentList;