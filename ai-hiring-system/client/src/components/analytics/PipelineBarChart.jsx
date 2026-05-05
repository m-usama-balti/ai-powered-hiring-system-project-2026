import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PipelineBarChart = ({ pipeline }) => {
    const data = {
        labels: ['Applied', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected'],
        datasets: [
            {
                label: 'Candidates',
                data: [
                    pipeline?.applied || 0,
                    pipeline?.shortlisted || 0,
                    pipeline?.interviewing || 0,
                    pipeline?.hired || 0,
                    pipeline?.rejected || 0
                ],
                backgroundColor: ['#94a3b8', '#6366f1', '#f59e0b', '#10b981', '#ef4444']
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    return <Bar data={data} options={options} />;
};

export default PipelineBarChart;
