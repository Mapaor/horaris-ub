import Link from 'next/link';
import styles from "../styles/Header.module.css";

export type Breadcrumb = {
    label: string;
    link?: string;
};

export default function Header({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
    return (
        <div className={styles.header}>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index}>
                    {breadcrumb.link ? (
                        <Link href={breadcrumb.link} className={styles.breadcrumbLink}>
                            {breadcrumb.label}
                        </Link>
                    ) : (
                        <span className={styles.breadcrumb}>{breadcrumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && <span className={styles.separator}> / </span>}
                </span>
            ))}
        </div>
    );
}
