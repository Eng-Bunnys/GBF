package org.bunnys.timer.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    @GetMapping
    public List<String> getAllStudySessions() {
        List<String> sessions = new ArrayList<>();
        sessions.add("Session 1: 2 hours");
        sessions.add("Session 2: 3 hours");
        return sessions;
    }
}
