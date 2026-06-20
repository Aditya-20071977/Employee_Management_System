import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Employee {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    department: string;
    designation: string;
    joiningDate: string;
}

export interface FormValues {
    fullName: string;
    email: string;
    mobile: string;
    department: string;
    designation: string;
    joiningDate: string;
}

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    success: string | null;
}

const initialState: EmployeeState = {
    employees: [],
    loading: false,
    error: null,
    success: null
};

export const fetchEmployees = createAsyncThunk(
    'employee/fetchEmployees',
    async (searchTerm: string | undefined, { rejectWithValue }) => {
        try {
            const url = searchTerm ? `/employees?search=${encodeURIComponent(searchTerm)}` : '/employees';
            const res = await api.get<Employee[]>(url);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to retrieve employees list');
        }
    }
);

export const addEmployee = createAsyncThunk(
    'employee/addEmployee',
    async (employeeData: FormValues, { rejectWithValue }) => {
        try {
            const res = await api.post('/employees/add', employeeData);
            return res.data; // contains message, employee
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Action failed. Please check inputs.');
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'employee/updateEmployee',
    async ({ id, employeeData }: { id: string; employeeData: FormValues }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/employees/${id}`, employeeData);
            return res.data; // contains message, employee
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Action failed. Please check inputs.');
        }
    }
);

export const deleteEmployee = createAsyncThunk(
    'employee/deleteEmployee',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/employees/${id}`);
            return { id, message: res.data.message || 'Employee deleted successfully' };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
        }
    }
);

const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        clearEmployeeStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add
            .addCase(addEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message || 'Employee added successfully';
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message || 'Employee updated successfully';
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteEmployee.pending, (state) => {
                state.error = null;
                state.success = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.success = action.payload.message;
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export const { clearEmployeeStatus } = employeeSlice.actions;
export default employeeSlice.reducer;
