import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { StyledTableCell, StyledTableRow } from "./components/Table";
import { get, map, isEmpty, debounce } from "lodash";
import { httpClient } from "./api";

const AppComponent = () => {
  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("funny");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 25;

  useEffect(() => {
    fetchData(); // Gọi API khi component load lần đầu
  }, []);

  useEffect(() => {
    if (offset > 0) {
      fetchData(); // Gọi API khi offset thay đổi
    }
  }, [offset]);

  // Thêm một useEffect để xử lý logic gọi API khi searchQuery rỗng
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setOffset(0); // Reset offset
      setData([]); // Xóa dữ liệu cũ
      setHasMore(true); // Đảm bảo có thể tải lại dữ liệu
      fetchData("funny"); // Gọi API mặc định
    }
  }, [searchQuery]); // Chỉ kích hoạt khi searchQuery thay đổi

  const fetchData = async () => {
    try {
      if (!hasMore) return;
      setLoading(offset === 0);
      setLoadingMore(offset > 0);

      const response = await httpClient.get(
        `?api_key=NRR7ajbCtZtFEazONT1UVSqKFTSnXhYE&q=${
          isEmpty(searchQuery) ? "funny" : searchQuery
        }&limit=${limit}&offset=${offset}&rating=g&lang=en`
      );

      if (get(response, "status") === 200) {
        const newData = get(response, "data.data", []);
        setData((prevData) => [...prevData, ...newData]);
        if (newData.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleInputChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const onInputChange = (event) => {
    handleInputChange(event.target.value); // Truyền giá trị nhập vào
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && searchQuery.trim() !== "") {
      setOffset(0); // Reset offset
      setData([]); // Xóa dữ liệu cũ
      setHasMore(true); // Đảm bảo có thể tải lại dữ liệu
      fetchData(); // Gọi API với giá trị tìm kiếm hiện tại
    }
  };
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (
      scrollHeight - scrollTop <= clientHeight + 100 &&
      !loadingMore &&
      hasMore
    ) {
      setOffset((prevOffset) => prevOffset + 1);
    }
  };

  const renderTableRows = map(data, (item, index) => (
    <StyledTableRow key={`${get(item, "id", "")}-${index}`}>
      <StyledTableCell>{get(item, "username", "")}</StyledTableCell>
      <StyledTableCell>{get(item, "name.source", "")}</StyledTableCell>
      <StyledTableCell>{get(item, "title", "")}</StyledTableCell>
      <StyledTableCell>{get(item, "slug", "")}</StyledTableCell>
      <StyledTableCell>
        <img
          loading="lazy"
          src={get(item, "images.fixed_width_small.url")}
          alt={get(item, "title", "")}
          height={get(item, "images.fixed_width_small.height")}
          width={get(item, "images.fixed_width_small.width")}
        />
      </StyledTableCell>
    </StyledTableRow>
  ));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2 }}>
        <TextField
          placeholder="Search..."
          onChange={onInputChange} // Gọi khi thay đổi giá trị
          onKeyDown={handleKeyPress} // Chỉ gọi API khi nhấn Enter
        />
      </Box>
      <TableContainer
        id="scrollable-table-container"
        component={Paper}
        sx={{
          maxHeight: 800,
          overflowY: "auto",
        }}
        onScroll={handleScroll}
      >
        <Table
          stickyHeader
          sx={{ minWidth: 700 }}
          aria-label="customized table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell>Username</StyledTableCell>
              <StyledTableCell>Source</StyledTableCell>
              <StyledTableCell>Title</StyledTableCell>
              <StyledTableCell>Slug</StyledTableCell>
              <StyledTableCell>Images</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !loadingMore ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                    }}
                  >
                    <CircularProgress size="4rem" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isEmpty(data) ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>Data Not Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              renderTableRows
            )}
            {loadingMore && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size="2rem" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AppComponent;
