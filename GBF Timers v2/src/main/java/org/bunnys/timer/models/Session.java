package org.bunnys.timer.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "study sessions")
public class Session {
    @Id
    private String id;
    private String subject;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes;

    public Session(String subject, LocalDateTime startTime, LocalDateTime endTime) {
        this.subject = subject;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = (int) java.time.Duration.between(startTime, endTime).toSeconds();
    }

    public String getId() { return id; }
    public String getSubject() { return subject; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public int getDurationMinutes() { return durationMinutes; }

    public void setSubject(String subject) { this.subject = subject; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}
