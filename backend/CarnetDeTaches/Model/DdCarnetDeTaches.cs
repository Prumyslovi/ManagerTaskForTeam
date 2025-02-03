using Microsoft.EntityFrameworkCore;
using System;

namespace CarnetDeTaches.Model
{
    public class DdCarnetDeTaches : DbContext
    {
        public DdCarnetDeTaches(DbContextOptions<DdCarnetDeTaches> options) 
            : base(options)
        {
        }
        public DbSet<Member> Members { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<MemberRole> MemberRoles { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Task> Tasks { get; set; }

    }
}
