using Microsoft.EntityFrameworkCore;
using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.Infrastructure.Data
{
    public class ManagerTaskForTeamDbContext : DbContext
    {
        public DbSet<Member> Members { get; set; }
        public DbSet<MemberRole> MemberRoles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Domain.Entities.Task> Tasks { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentChange> DocumentChanges { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<TaskDependency> TaskDependencies { get; set; }

        public ManagerTaskForTeamDbContext(DbContextOptions<ManagerTaskForTeamDbContext> options)
            : base(options)

        {
        }
       
    }
}