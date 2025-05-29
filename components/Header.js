import styles from "../styles/Header.module.css";

export default function Header({ breadcrumbs }) {
    return (
        <div className={styles.header}>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index}>
                    {breadcrumb.link ? (
                        <a href={breadcrumb.link} className={styles.breadcrumbLink}>
                            {breadcrumb.label}
                        </a>
                    ) : (
                        <span className={styles.breadcrumb}>{breadcrumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && <span className={styles.separator}> / </span>}
                </span>
            ))}
        </div>
    );
}