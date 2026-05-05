import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SkillGapDoughnut = ({ recommendations }) => {
    const missingCounts = {};

    (recommendations || []).forEach((item) => {
        (item.missing_skills || []).forEach((skill) => {
            missingCounts[skill] = (missingCounts[skill] || 0) + 1;
        });
    });

    const labels = Object.keys(missingCounts).slice(0, 6);
    const values = labels.map((label) => missingCounts[label]);

    const data = {
        labels: labels.length ? labels : ['No gaps'],
        datasets: [
            {
                data: values.length ? values : [1],
                backgroundColor: ['#4f46e5', '#06b6d4', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444']
            }
        ]
    };

    return <Doughnut data={data} />;
};

export default SkillGapDoughnut;
