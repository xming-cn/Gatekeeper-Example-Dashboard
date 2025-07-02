'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPanel from '@/components/command/CommandPanel';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <CommandPanel />
    </DashboardLayout>
  );
}
