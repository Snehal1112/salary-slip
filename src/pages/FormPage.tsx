import React from 'react';
import CompanyDetailsCard from '../components/CompanyDetailsCard';
import { Container, TextField, Box, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Switch, FormControlLabel, Divider } from '@mui/material';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveSlip } from '../features/salary/salarySlice';
import { setCompany } from '../features/salary/salarySlice';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';

interface Company {
	name: string;
	address: string[];
	mobile?: string;
	gstin?: string;
	email?: string;
	website?: string;
}

interface Employee {
	name: string;
	code?: string;
	designation?: string;
	pan?: string;
	bankAccount?: string;
	bankName?: string;
	chequeNumber?: string;
}

interface WorkingDays {
	totalWorkingDays: number;
	daysAttended: number;
	leavesTaken: number;
	balanceLeaves: number;
}

interface IncomeItem {
	particular: string;
	amount: number;
}

interface DeductionItem {
	particular: string;
	amount: number;
}

interface TemplateSettings {
	titleText?: string;
	titleAlign?: string;
	showCompanyName?: boolean;
	showCompanyAddress?: boolean;
}

interface FormValues {
	company: Company;
	employee: Employee;
	workingDays: WorkingDays;
	income: IncomeItem[];
	deductions: DeductionItem[];
	template: TemplateSettings;
}

const schema = yup.object({
	company: yup.object({
		name: yup.string().required('Company name required'),
		address: yup.array().of(yup.string().required('Address line required')).min(1, 'At least one address line required').required(),
		mobile: yup.string().optional(),
		gstin: yup.string().optional(),
		email: yup.string().email().optional(),
		website: yup.string().url().optional(),
	}),
	employee: yup.object({
		name: yup.string().required('Employee name required'),
		code: yup.string().optional(),
		designation: yup.string().optional(),
		pan: yup.string().optional(),
		bankAccount: yup.string().optional(),
		bankName: yup.string().optional(),
		chequeNumber: yup.string().optional(),
	}),
	workingDays: yup.object({
		totalWorkingDays: yup.number().min(0).required(),
		daysAttended: yup.number().min(0).required(),
		leavesTaken: yup.number().min(0).required(),
		balanceLeaves: yup.number().min(0).required(),
	}).required(),
	income: yup.array().of(yup.object({ particular: yup.string().required(), amount: yup.number().min(0).required() })).required(),
	deductions: yup.array().of(yup.object({ particular: yup.string().required(), amount: yup.number().min(0).required() })).required(),
	template: yup.object({
		titleText: yup.string().optional(),
		titleAlign: yup.string().optional(),
		showCompanyName: yup.boolean().optional(),
		showCompanyAddress: yup.boolean().optional(),
	}).required(),
});

const FormPage: React.FC = () => {
	const currentRaw = useAppSelector((s) => s.salary.current);
	// Migrate company.address from string to array if needed
	const current: FormValues = {
		...currentRaw,
		company: {
			...currentRaw.company,
			address: Array.isArray(currentRaw.company?.address)
				? currentRaw.company.address
				: currentRaw.company?.address
					? [currentRaw.company.address]
					: [''],
		},
		template: currentRaw.template || {},
	};
	const [companyDetails, setCompanyDetails] = React.useState(current.company);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const {
		register,
		handleSubmit,
		control,
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: current,
	});

	const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({ control, name: 'income' });
	const { fields: dedFields, append: appendDed, remove: removeDed } = useFieldArray({ control, name: 'deductions' });
	// For nested field array, useFieldArray must be called with the correct type and path

	const onSubmit = () => {
		const companyForRedux = {
			name: companyDetails.name || '',
			address: Array.isArray(companyDetails.address)
				? companyDetails.address.join(', ')
				: companyDetails.address || '',
			mobile: companyDetails.mobile || '',
			gstin: companyDetails.gstin || '',
			email: companyDetails.email || '',
			website: companyDetails.website || '',
		};
		dispatch(setCompany(companyForRedux));
		dispatch(saveSlip());
		navigate('/preview');
	};

	return (
		<Container sx={{ py: 3 }}>
			<PageBreadcrumbs muted size="small" />
			<form onSubmit={handleSubmit(onSubmit)}>
				{/* Company & Employee Details Section - now two separate cards */}
				<Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
					<Box sx={{ flex: '1 1 0' }}>
						<CompanyDetailsCard value={companyDetails} onChange={setCompanyDetails} />
					</Box>
					<Box sx={{ flex: '1 1 0' }}>
						<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
							<Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Employee Details</Typography>
							<TextField label="Employee Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.name')} />
							<TextField label="Employee Code" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.code')} />
							<TextField label="Designation" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.designation')} />
							<TextField label="PAN" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.pan')} />
							<TextField label="Bank Account Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.bankAccount')} />
							<TextField label="Bank Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.bankName')} />
							<TextField label="Cheque Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.chequeNumber')} />
							<Box sx={{ mt: 4 }}>
								<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Working Days</Typography>
								<TextField label="Total Working Days" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.totalWorkingDays')} />
								<TextField label="Number of Working Days Attended" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.daysAttended')} />
								<TextField label="Leaves Taken" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.leavesTaken')} />
								<TextField label="Balance Leaves" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.balanceLeaves')} />
							</Box>
						</Paper>
					</Box>
				</Box>
				{/* Income & Deductions Section */}
				<Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
					<Box sx={{ flex: '1 1 0' }}>
						<Paper variant="outlined" sx={{ p: 2 }}>
							<Typography variant="h6" gutterBottom>Income</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Particular</TableCell>
										<TableCell align="right">Amount</TableCell>
										<TableCell></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{incomeFields.map((f, i) => (
										<TableRow key={f.id}>
											<TableCell>
												<TextField fullWidth defaultValue={f.particular} {...register(`income.${i}.particular` as const)} size="small" />
											</TableCell>
											<TableCell align="right" sx={{ width: '20%' }}>
												<TextField type="number" defaultValue={f.amount} {...register(`income.${i}.amount` as const)} inputProps={{ min: 0 }} size="small" sx={{ width: 72 }} />
											</TableCell>
											<TableCell sx={{ width: '10%' }}>
												<IconButton size="small" onClick={() => removeIncome(i)} aria-label="remove income"><DeleteIcon fontSize="small" /></IconButton>
											</TableCell>
										</TableRow>
									))}
									<TableRow>
										<TableCell colSpan={3}>
											<Button startIcon={<AddIcon />} onClick={() => appendIncome({ particular: 'New', amount: 0 })} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Add Income</Button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Paper>
					</Box>
					<Box sx={{ flex: '1 1 0' }}>
						<Paper variant="outlined" sx={{ p: 2 }}>
							<Typography variant="h6" gutterBottom>Deductions</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Particular</TableCell>
										<TableCell align="right">Amount</TableCell>
										<TableCell></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{dedFields.map((f, i) => (
										<TableRow key={f.id}>
											<TableCell>
												<TextField fullWidth defaultValue={f.particular} {...register(`deductions.${i}.particular` as const)} size="small" />
											</TableCell>
											<TableCell align="right">
												<TextField type="number" defaultValue={f.amount} {...register(`deductions.${i}.amount` as const)} inputProps={{ min: 0 }} size="small" sx={{ width: 72 }} />
											</TableCell>
											<TableCell>
												<IconButton size="small" onClick={() => removeDed(i)} aria-label="remove deduction"><DeleteIcon fontSize="small" /></IconButton>
											</TableCell>
										</TableRow>
									))}
									<TableRow>
										<TableCell colSpan={3}>
											<Button startIcon={<AddIcon />} onClick={() => appendDed({ particular: 'New Deduction', amount: 0 })} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Add Deduction</Button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Paper>
					</Box>
				</Box>
				<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
					<Box sx={{ display: 'flex', gap: 3 }}>
						<Typography>Total Income: <strong>{currentRaw.totalIncome}</strong></Typography>
						<Typography>Total Deductions: <strong>{currentRaw.totalDeductions}</strong></Typography>
						<Typography>Net: <strong>{currentRaw.netSalary}</strong></Typography>
					</Box>
					<Box>
						<Button type="submit" variant="contained" color="primary" size="small" sx={{ mr: 1, px: 3 }}>SAVE SLIP</Button>
						<Button variant="outlined" href="/preview" size="small">PREVIEW</Button>
					</Box>
				</Box>
				<Divider sx={{ my: 3 }} />
				{/* Template settings */}
				<Paper sx={{ p: 2 }}>
					<Typography variant="subtitle1">Template settings</Typography>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
						<TextField label="Title text" {...register('template.titleText')} sx={{ flex: 1 }} />
						<TextField label="Title align" {...register('template.titleAlign')} sx={{ width: 160 }} />
					</Box>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
						<Controller
							name="template.showCompanyName"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
									label="Show company name"
								/>
							)}
						/>
						<Controller
							name="template.showCompanyAddress"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
									label="Show company address"
								/>
							)}
						/>
					</Box>
				</Paper>
			</form>
		</Container>
	);
};

export default FormPage;
