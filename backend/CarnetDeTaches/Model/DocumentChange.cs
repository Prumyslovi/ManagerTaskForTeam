﻿using CarnetDeTaches.Model;
using System.ComponentModel.DataAnnotations.Schema;

[Table("DocumentChange")]
public class DocumentChange
{
    [Column("DocumentChangeId")]
    public Guid DocumentChangeId { get; set; }
    [Column("DocumentId")]
    [ForeignKey("Document")]
    public Guid DocumentId { get; set; }
    [Column("MemberId")]
    [ForeignKey("Member")]
    public Guid MemberId { get; set; }
    [Column("ChangeDescription")]
    public string ChangeDescription { get; set; }
    [Column("ChangedAt")]
    public DateTime ChangedAt { get; set; }

    public Document Document { get; set; }
    public Member Member { get; set; }
}