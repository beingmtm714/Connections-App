import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: number | string;
  link: string;
  linkText: string;
}

export default function StatCard({ title, value, link, linkText }: StatCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">
          {title}
        </dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          {value}
        </dd>
      </div>
      <div className="bg-gray-50 px-4 py-2 sm:px-6">
        <div className="text-sm">
          <Link href={link}>
            <a className="font-medium text-primary hover:text-indigo-700">
              {linkText}
            </a>
          </Link>
        </div>
      </div>
    </Card>
  );
}
